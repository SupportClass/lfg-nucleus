'use strict';

const server = require('../../../lib/server');
const clone = require('clone');
const Subscription = require('./classes/subscription');
const Cheer = require('./classes/cheer');
const Tip = require('./classes/tip');
const {SubMysteryGift, SubGift} = require('./classes/subgift');
const Host = require('./classes/host');
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Modules that will be populated once we have the nodecg api loaded
let nodecg;
let wordfilter;
let emailfilter;
let train;
let history;
let flagged;
let tipThreshold;
let cheerThreshold;

module.exports = function (extensionApi) {
	nodecg = extensionApi;

	if (nodecg.bundleConfig && nodecg.bundleConfig.noResubsOnTrain) {
		nodecg.log.warn('WARNING! noResubsOnTrain is set to true! You probably don\'t want this!');
	}

	tipThreshold = nodecg.Replicant('tipThreshold', {defaultValue: 1});
	cheerThreshold = nodecg.Replicant('cheerThreshold', {defaultValue: 100});

	history = require('./history')(nodecg, module.exports);
	flagged = require('./flagged')(nodecg, module.exports);
	wordfilter = nodecg.extensions['lfg-filter'].wordfilter;
	emailfilter = nodecg.extensions['lfg-filter'].emailfilter;

	// Wait until extensions load before starting services
	server.on('extensionsLoaded', () => {
		require('./services')(nodecg, module.exports);

		if ({}.hasOwnProperty.call(nodecg.extensions, 'lfg-hypetrain')) {
			train = nodecg.extensions['lfg-hypetrain'];
		}
	});

	// Manual notes sent from the dashboard
	nodecg.listenFor('manualNote', noteOpts => {
		if (noteOpts.type === 'subscription') {
			emitNote(new Subscription(noteOpts));
		} else if (noteOpts.type === 'cheer') {
			emitNote(new Cheer(noteOpts));
		} else if (noteOpts.type === 'tip') {
			emitNote(new Tip(noteOpts));
		} else if (noteOpts.type === 'hosted') {
			emitNote(new Host(noteOpts));
		} else if (noteOpts.type === 'subgift') {
			emitNote(new SubGift(noteOpts));
		} else if (noteOpts.type === 'submysterygift') {
			emitNote(new SubMysteryGift(noteOpts));
		} else {
			nodecg.log.error(`Invalid type send to manualNote: ${noteOpts.type}`);
		}
	});

	return emitter;
};

function _emitTip(tip, filter) {
	if (typeof filter === 'undefined') {
		filter = true;
	}

	// filters email and filters words in the name
	if (filter) {
		if (emailfilter(tip.email)) {
			tip.flagged = true;
			tip.flagReason = `${tip.email} is blacklisted.`;
		} else if (wordfilter(tip.name)) {
			tip.flagged = true;
			tip.flagReason = 'Username contains a blacklisted word.';
		} else if (wordfilter(tip.comment)) {
			tip.flagged = true;
			tip.flagReason = 'Comment contains a blacklisted word.';
		} else if (tip.amount < tipThreshold.value) {
			tip.flagged = true;
			tip.flagReason = `Tip amount is below display threshold ($${tipThreshold.value})`;
		}

		if (tip.flagged) {
			flagged.add(tip);
			return;
		}
	}

	// Notify all bundles of the new tip
	nodecg.sendMessage('tip', tip);
	emitter.emit('tip', tip);
	history.add(tip);
}

function _emitSubscription(subscription, filter) {
	if (typeof filter === 'undefined') {
		filter = true;
	}

	// I'm not sure how train data could be here, but it sometimes is.
	// We don't want train data to get logged in the history.
	if ({}.hasOwnProperty.call(subscription, 'train')) {
		delete subscription.train;
	}

	if (filter) {
		if (wordfilter(subscription.name)) {
			subscription.flagged = true;
			subscription.flagReason = 'Username contains a blacklisted word.';
		} else if (wordfilter(subscription.comment)) {
			subscription.flagged = true;
			subscription.flagReason = 'Comment contains a blacklisted word.';
		}

		if (subscription.flagged) {
			flagged.add(subscription);
			return;
		}
	}
	history.add(clone(subscription));

	// 2015-08-31 - Dumb bullshit I added to make lirik-stack work.
	if (nodecg.bundleConfig && nodecg.bundleConfig.noResubsOnTrain && subscription.resub) {
		nodecg.sendMessage('subscription', subscription);
		emitter.emit('subscription', subscription);
		return;
	}

	// Increments the train by one THEN sends out the socket message with the sub train data.
	if (train) {
		subscription.train = train.addPassenger();
	}

	nodecg.sendMessage('subscription', subscription);
	emitter.emit('subscription', subscription);
}

function _emitCheer(cheer, filter) {
	if (typeof filter === 'undefined') {
		filter = true;
	}

	// filters email and filters words in the name
	if (filter) {
		if (wordfilter(cheer.name)) {
			cheer.flagged = true;
			cheer.flagReason = 'Username contains a blacklisted word.';
		} else if (wordfilter(cheer.comment)) {
			cheer.flagged = true;
			cheer.flagReason = 'Comment contains a blacklisted word.';
		} else if (cheer.amount < cheerThreshold.value) {
			cheer.flagged = true;
			cheer.flagReason = `Cheer amount is below display threshold (${cheerThreshold.value})`;
		}

		if (cheer.flagged) {
			flagged.add(cheer);
			return;
		}
	}

	// Notify all bundles of the new cheer
	nodecg.sendMessage('cheer', cheer);
	emitter.emit('cheer', cheer);
	history.add(cheer);
}

function _emitHost(host, filter) {
	if (typeof filter === 'undefined') {
		filter = true;
	}

	if (filter) {
		if (wordfilter(host.name)) {
			host.flagged = true;
			host.flagReason = 'Username contains a blacklisted word.';
		}

		if (host.flagged) {
			flagged.add(host);
			return;
		}
	}

	nodecg.sendMessage('hosted', host);
	emitter.emit('hosted', host);
	history.add(host);
}

/**
 * Emits a note to extensions via the exported EventEmitter, and to clients via nodecg.sendMessage.
 * Also adds the note to the history. If the note's content is caught by the filter, it will not be emitted
 * as a normal note, and will instead be added to the flaggedNotes replicant and displayed on the dashboard
 * for the user to accept or reject.
 * @param note {Note} The note to emit.
 * @param [filter=true] {Boolean} Whether or not to subject this note to the filter.
 */
function emitNote(note, filter) {
	if (typeof filter === 'undefined') {
		filter = true;
	}

	if (note.type === 'subscription') {
		_emitSubscription(note, filter);
	} else if (note.type === 'cheer') {
		_emitCheer(note, filter);
	} else if (note.type === 'tip') {
		_emitTip(note, filter);
	} else if (note.type === 'hosted') {
		_emitHost(note, filter);
	} else {
		nodecg.log.error('Unknown note type:', note.type);
	}
}

module.exports.emitNote = emitNote;

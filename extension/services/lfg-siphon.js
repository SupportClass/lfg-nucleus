'use strict';

const Subscription = require('../classes/subscription');
const Cheer = require('../classes/cheer');
const {SubMysteryGift, SubGift} = require('../classes/subgift');
const Host = require('../classes/host');

module.exports = function (nodecg, nucleus) {
	const siphon = nodecg.extensions['lfg-siphon'];
	siphon.on('subscription', data => {
		nucleus.emitNote(new Subscription({
			name: data.username,
			channel: data.channel,
			resub: data.resub,
			months: data.months,
			timestamp: data.ts,
			message: data.message
		}));
	});

	siphon.on('cheer', data => {
		nucleus.emitNote(new Cheer({
			name: data.userstate['display-name'],
			amount: data.userstate.bits,
			message: data.message,
			channel: data.channel,
			timestamp: data.ts
		}));
	});

	siphon.on('submysterygift', data => {
		nucleus.emitNote(new SubMysteryGift({
			channel: data.channel,
			name: data.username,
			amount: data.amount,
			timestamp: data.ts
		}));
	});

	siphon.on('subgift', data => {
		nucleus.emitNote(new SubGift({
			channel: data.channel,
			name: data.username,
			resub: data.resub,
			months: data.months,
			message: data.message,
			timestamp: data.ts
		}));
	});

	siphon.on('hosted', data => {
		nucleus.emitNote(new Host({
			channel: data.channel,
			name: data.username,
			viewers: data.viewers,
			raid: data.raid,
			timestamp: data.ts
		}));
	});
};

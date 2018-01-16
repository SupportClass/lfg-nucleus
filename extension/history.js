'use strict';

const clone = require('clone');

const HISTORY_LEN = 60;

module.exports = function (nodecg) {
	const history = nodecg.Replicant('history', {defaultValue: []});
	const subscriptions = nodecg.Replicant('subscriptions', {defaultValue: []});
	const tips = nodecg.Replicant('tips', {defaultValue: []});

	nodecg.listenFor('getHistory', (length, cb) => {
		if (typeof length === 'number') {
			cb(history.value.slice(0, length));
		} else {
			cb(history.value);
		}
	});

	nodecg.listenFor('clearHistory', () => {
		history.value = [];
		subscriptions.value = [];
		tips.value = [];
	});

	nodecg.listenFor('markRead', id => {
		const note = find(id);
		if (note) {
			note.read = true;
		}
	});

	/**
	 * Adds a note to both the unified history replicant and the type-specific history replicant.
	 * @param note {Note} The note to add to the history.
	 */
	function add(note) {
		history.value.unshift(note);
		_trimExcess(history, HISTORY_LEN);

		note = clone(note)
		if (note.type === 'subscription') {
			subscriptions.value.unshift(note);
			_trimExcess(subscriptions, HISTORY_LEN / 2);
		} else if (note.type === 'tip') {
			tips.value.unshift('note');
			_trimExcess(tips, HISTORY_LEN / 2);
		}

		// Ensure we don't exceed a history of HISTORY_LEN
		while (history.length > HISTORY_LEN) {
			history.shift(); // remove from the front of the array, newest items are pushed onto the end
		}
	}

	/**
	 * Finds a note with a given ID in the history replicant.
	 * @param id {String} The UUID to search for.
	 * @returns {Note|undefined}
	 */
	function find(id) {
		let note;
		history.value.some(historyNote => {
			if (historyNote.id === id) {
				note = historyNote;
				return true;
			}

			return false;
		});
		return note;
	}

	/**
	 * Trims an array Replicant to a max length, discarding the excess items.
	 * @param rep {Replicant} The Replicant to trim.
	 * @param maxLength {Number} The length to trip the Replicant to.
	 * @private
	 */
	function _trimExcess(rep, maxLength) {
		if (rep.value.length > maxLength) {
			rep.value.length = maxLength;
		}
	}

	return {
		add,
		find
	};
};

'use strict';

const Subscription = require('../classes/subscription');
const Cheer = require('../classes/cheer');

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
};

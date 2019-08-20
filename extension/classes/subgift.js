'use strict';

const Note = require('./note.js');

class SubGift extends Note {
	constructor(options) {
		super(options);
		this.type = 'subgift';
		this.channel = options.channel || '';
		this.months = options.months || 0;
		this.resub = Boolean(options.resub);
		this.profileUrl = `https://twitch.tv/${options.name}`;
		this.recipientUrl = `https://twitch.tv/${options.recipient}`;
	}
}

class SubMysteryGift extends Note {
	constructor(options) {
		super(options);
		this.type = 'submysterygift';
		this.channel = options.channel || '';
		this.profileUrl = `https://twitch.tv/${options.name}`;
	}
}

module.exports.SubGift = SubGift;
module.exports.SubMysteryGift = SubMysteryGift;

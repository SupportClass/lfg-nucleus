'use strict';

const Note = require('./note.js');

module.exports = class Raid extends Note {
	constructor(options) {
		super(options);
		this.type = 'raided';
		this.channel = options.channel || '';
		this.amount = options.amount || 0;
		this.profileUrl = `https://twitch.tv/${options.name}`;
	}
};

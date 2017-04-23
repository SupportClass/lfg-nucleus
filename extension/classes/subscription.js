'use strict';

const Note = require('./note.js');

module.exports = class Subscription extends Note {
	constructor(options) {
		super(options);
		this.type = 'subscription';
		this.channel = options.channel || '';
		this.months = options.months || 0;
		this.resub = Boolean(options.resub);
		this.profileUrl = `https://twitch.tv/${options.name}`;
		this.comment = options.message ? options.message.trim() : '';
	}
};

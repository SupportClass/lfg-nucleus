'use strict';

const Note = require('./note.js');

module.exports = class Host extends Note {
	constructor(options) {
		super(options);
		this.type = 'hosted';
		this.channel = options.channel || '';
		this.viewers = options.viewers || 0;
		this.raid = Boolean(options.raid);
		this.profileUrl = `https://twitch.tv/${options.name}`;
	}
};

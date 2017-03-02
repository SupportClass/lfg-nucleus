'use strict';

const Note = require('./note.js');
const numeral = require('numeral');

module.exports = class Cheer extends Note {
	constructor(options) {
		super(options);
		this.type = 'cheer';
		this.amount = options.amount || 0;
		this.formattedAmount = numeral(parseFloat(this.amount)).format(`0,0[.]00`);
		this.comment = options.message ? options.message.replace(/cheer[0-9]+/g, '').trim() : '';
		this.top = options.top || null;
		this.profileUrl = `https://twitch.tv/${options.name}`;
	}
};

(function () {
	'use strict';

	const CHEER_COLORS = [
		'#d3d3d3', // 1 Bit
		'#f1b7ff', // 100 Bits
		'#75f7e0', // 1,000 Bits
		'#b4d1ff', // 5,000 Bits
		'#fab4b4', // 10,000 Bits
		'#fed75f'  // 100,000 Bits
	];

	Polymer({
		is: 'list-note',

		properties: {
			type: {
				type: String,
				reflectToAttribute: true
			},
			note: {
				type: Object,
				observer: '_noteChanged'
			}
		},

		_noteChanged(note) {
			this.name = note.name;
			this.id = note.id;
			this.profileUrl = note.profileUrl || false;
			this.flagged = typeof note.flagged === 'undefined' ? false : note.flagged;
			this.timestamp = note.timestamp;
			this.comment = note.comment;

			if (note.type === 'tip' || note.type === 'cheer') {
				this.amount = note.amount;
				this.formattedAmount = note.formattedAmount;
			} else if (note.type === 'subscription') {
				this.resub = note.resub;
				this.months = note.months;
			}

			if (note.flagged) {
				this.comment = note.flagReason;
			}

			this.$.bitsIcon.hidden = note.type !== 'cheer';

			this._updateBackgroundColor(note);

			// Set this last so the computed bindings have everything they need.
			this.type = note.type;
		},

		_updateBackgroundColor(note) {
			if (note.type === 'subscription') {
				this.$.info.style.backgroundColor = '#C9CDE0';
			} else if (note.type === 'tip') {
				this.$.info.style.backgroundColor = '#d9ead3';
			} else if (note.type === 'cheer') {
				const cheerTier = calcCheerTier(note.amount);
				this.$.info.style.backgroundColor = CHEER_COLORS[cheerTier];
			}
		},

		_computeLabel(type) {
			if (type === 'tip' || type === 'cheer') {
				return this.formattedAmount;
			}

			if (type === 'subscription') {
				return this.resub ? `x${this.months}` : 'NEW';
			}

			return type;
		},

		accept() {
			nodecg.sendMessage('acceptFlaggedNote', this.id);
		},

		reject() {
			nodecg.sendMessage('rejectFlaggedNote', this.id);
		},

		dismiss() {
			nodecg.sendMessage('markRead', this.id);
		}
	});

	function calcCheerTier(numBits) {
		if (numBits >= 100000) {
			return 5;
		}

		if (numBits >= 10000) {
			return 4;
		}

		if (numBits >= 5000) {
			return 3;
		}

		if (numBits >= 1000) {
			return 2;
		}

		if (numBits >= 100) {
			return 1;
		}

		return 0;
	}
})();

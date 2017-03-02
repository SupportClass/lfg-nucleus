(function () {
	'use strict';

	const history = nodecg.Replicant('history');
	const flaggedNotes = nodecg.Replicant('flaggedNotes');
	const tipThreshold = nodecg.Replicant('tipThreshold');
	const cheerThreshold = nodecg.Replicant('cheerThreshold');

	Polymer({
		is: 'panel-body',

		properties: {
			selectedType: {
				type: String,
				value: 'subscription'
			}
		},

		ready() {
			flaggedNotes.on('change', newVal => {
				this._pruneList(this.$.flaggedList, flaggedNotes);

				newVal.forEach(note => {
					const noteEl = document.createElement('list-note');
					noteEl.note = note;
					this._addToListIfNotPresent(this.$.flaggedList, noteEl);
				});
			});

			history.on('change', newVal => {
				this._pruneList(this.$.recentList, history, true);

				newVal.slice(0).reverse().forEach(note => {
					if (!note.read) {
						const noteEl = document.createElement('list-note');
						noteEl.note = note;
						this._addToListIfNotPresent(this.$.recentList, noteEl);
					}
				});
			});

			tipThreshold.on('change', newVal => {
				this.$.minimumTipThreshold.value = newVal;
			});

			cheerThreshold.on('change', newVal => {
				this.$.minimumCheerThreshold.value = newVal;
			});
		},

		_addToListIfNotPresent(list, node) {
			const listChildren = list.getContentChildren('#content');
			const found = listChildren.some(child => child.id === node.id);
			if (!found) {
				Polymer.dom(list).appendChild(node);
			}
		},

		_pruneList(list, replicant, removeRead) {
			const listChildren = list.getContentChildren('#content');
			listChildren.forEach(child => {
				let read = false;
				const found = replicant.value.some(note => {
					if (child.id === note.id) {
						read = note.read;
						return true;
					}

					return false;
				});

				if ((read && removeRead) || !found) {
					Polymer.dom(list).removeChild(child);
				}
			});
		},

		send() {
			const name = this.$.name.value;
			const type = this.selectedType;
			const months = this.$.months.value;
			const amount = this.$.amount.value;

			const noteOpts = {
				name,
				type,
				timestamp: Date.now()
			};

			if (type === 'subscription') {
				if (months > 1) {
					noteOpts.resub = true;
					noteOpts.months = parseInt(months, 10);
				} else {
					noteOpts.resub = false;
				}
			} else if (type === 'tip' || type === 'cheer') {
				noteOpts.amount = parseFloat(amount);
			} else {
				console.error('[lfg-nucleus] Invalid manual note type:', type);
				return;
			}

			nodecg.sendMessage('manualNote', noteOpts);
		},

		isUnread(note) {
			return !note.read;
		},

		newestFirst(a, b) {
			return b.timestamp - a.timestamp;
		},

		_calcSendButtonText(selectedType) {
			switch (selectedType) {
				case 'subscription':
					return 'Send Subscription';
				case 'tip':
					return 'Send Tip';
				case 'cheer':
					return 'Send Cheer';
				default:
					return;
			}
		},

		isSubscription(selectedType) {
			return selectedType === 'subscription';
		},

		openSettingsDialog() {
			this.$.settingsDialog.open();
		},

		openClearHistoryDialog() {
			this.$.clearHistoryDialog.open();
		},

		_settingsDialogAccepted() {
			tipThreshold.value = this.$.minimumTipThreshold.value;
			cheerThreshold.value = this.$.minimumCheerThreshold.value;
		},

		_clearHistoryDialogAccepted() {
			nodecg.sendMessage('clearHistory');
		}
	});
})();

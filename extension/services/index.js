'use strict';

const semver = require('semver');
const integrations = {
	'lfg-siphon': '~0.5.0',
	'lfg-streamtip': '^1.0.0',
	'lfg-sublistener': '^3.0.0'
};

module.exports = function (nodecg, nucleus) {
	const bundles = require('../../../../lib/bundle-manager');

	Object.keys(integrations).forEach(bundleName => {
		const bundle = bundles.find(bundleName);
		if (!bundle) {
			return;
		}

		const targetRange = integrations[bundleName];
		if (semver.satisfies(bundle.version, targetRange)) {
			require(`./${bundleName}`)(nodecg, nucleus);
			nodecg.log.info(`Listening to ${bundleName}`);
		} else {
			nodecg.log.error(`The installed version of ${bundleName} is ${bundle.version}, ` +
			`but lfg-nucleus supports ${bundleName}@${targetRange}`);
			nodecg.log.error(`${bundleName} integration will not be enabled`);
		}
	});
};

# lfg-nucleus [![Build Status](https://travis-ci.org/SupportClass/lfg-nucleus.svg?branch=master)](https://travis-ci.org/SupportClass/lfg-nucleus)
> Meta bundle that ties together functionality from other "lfg" helper bundles.

![screenshot](screenshot.png)

lfg-nucleus is useful for normalizing and centrally managing events from multiple other bundles. 
At this time, lfg-nucleus integrates with:
- [lfg-hypetrain](https://github.com/SupportClass/lfg-hypetrain)
- [lfg-siphon](https://github.com/SupportClass/lfg-siphon)@~0.5.0
- [lfg-streamtip](https://github.com/SupportClass/lfg-streamtip)@~1.0.0
- [lfg-sublistener](https://github.com/SupportClass/lfg-sublistener)@^3.0.0

lfg-nucleus depends on:
 - [lfg-filter](https://github.com/SupportClass/lfg-filter)@^4.0.0
 
## Using in your bundle

lfg-nucleus emits three events: `subscription`, `cheer`, and `tip`.

### In a graphic or dashboard panel
```js
nodecg.listenFor('subscription', 'lfg-nucleus', subscription => {
    // do work
});

nodecg.listenFor('cheer', 'lfg-nucleus', cheer => {
    // do work
});

nodecg.listenFor('tip', 'lfg-nucleus', tip => {
    // do work
});
```

### In an extension
First, add `lfg-nucleus` to your bundle's [`nodecg.bundleDependencies`](http://nodecg.com/tutorial-manifest.html).

Then, create code like the following:
```js
module.exports = function (nodecg) {
    const nucleus = nodecg.extensions['lfg-nucleus'];

    nucleus.on('subscription', subscription => {
        // do work
    });

    nucleus.on('cheer', subscription => {
		// do work
	});

    nucleus.on('tip', tip => {
        // do work
    });
};
```

## Data Structures

### Subscription
```js
{
    "name": "langeh",
    "timestamp": 1456809247462,
    "id": "852d1475-6bac-4abe-bcd1-e5805db1caa1",
    "read": false,
    "type": "subscription",
    "channel": "chrishanel",
    "months": 3,
    "resub": true,
    "profileUrl": "https://twitch.tv/langeh",
    
    // Only present when lfg-hypetrain is installed.
    "train": {
        "passengers": 239,
        "dayTotal": 39,
        "threshold": 10,
        "isHype": true
    }
}
```

### Cheer (bits)
```js
{
    "name": "langeh",
    "timestamp": 1456809533513,
    "id": "8f2ea9cb-2e8f-45dd-8645-0b724b2774f6",
    "read": false,
    "type": "cheer",
    "amount": 1000,
    "formattedAmount": "1,000",
    "comment": "Hi streamer!",
    "email": "email@alexvan.camp",
    "profileUrl": "https://twitch.tv/langeh",
    
    // Will be "daily" or "monthly" if this tip is the top cheer of the day or month.
    "top": null
}
```

### Tip
```js
{
    "name": "langeh",
    "timestamp": 1456809533513,
    "id": "8f2ea9cb-2e8f-45dd-8645-0b724b2774f6",
    "read": false,
    "type": "tip",
    "amount": 5,
    "currency": "$",
    "formattedAmount": "$5",
    "comment": "Hi streamer!",
    "email": "email@alexvan.camp",
    
    // Will be "daily" or "monthly" if this tip is the top tip of the day or month.
    "top": null
}
```


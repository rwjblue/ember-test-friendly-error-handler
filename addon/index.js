import { resolve } from 'rsvp';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

let squelchedLabels;

export let squelchErrorHandlerFor = null;
export let unsquelchAllErrorHandlers = null;

const excludeValue = (array, val) => {
  const pos = array.indexOf(val);
  return pos !== -1 ? array.slice(0, pos).concat(array.slice(pos + 1, array.length)) : array;
};

if (DEBUG) {
  squelchedLabels = Object.create(null);

  squelchErrorHandlerFor = function squelchErrorHandlerFor(label) {
    squelchedLabels[label] = true;
  };

  unsquelchAllErrorHandlers = function unsquelchAllErrorHandlers() {
    squelchedLabels = Object.create(null);
  };
}

export default function(label, callback) {
  assert('ember-test-friendly-error-handler requires a label', label);
  if (!DEBUG) {
    return callback;
  }

  let recentReasons = [];
  return function(reason) {
    // avoid reentrance and infinite async loops
    const desc = reason.toString();
    const pos = recentReasons.indexOf(desc);
    if (pos !== -1) {
      recentReasons = recentReasons
        .slice(0, pos)
        .concat(recentReasons.slice(pos + 1, recentReasons.length));
      return;
    }

    recentReasons = recentReasons.concat(desc);

    // only call the callback when squelched
    if (squelchedLabels[label]) {
      return callback(reason);
    }

    // otherwise call the callback, and rethrow
    return resolve(callback(reason)).then(() => {
      throw reason;
    });
  };
}

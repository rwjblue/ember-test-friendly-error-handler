import { resolve } from 'rsvp';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

let squelchedLabels;

export let squelchErrorHandlerFor = null;
export let unsquelchAllErrorHandlers = null;

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

  let lastReason;
  return function(reason) {
    if (reason === lastReason) {
      lastReason = null;
      return;
    }

    lastReason = reason;

    if (squelchedLabels[label]) {
      return callback(reason);
    }

    return resolve(callback(reason)).then(() => {
      throw reason;
    });
  };
}

import { resolve } from 'rsvp';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

let squelchedLabels;

export let squelchCatchHandlerFor = null;
export let unsquelchAllCatchHandlers = null;

if (DEBUG) {
  squelchedLabels = Object.create(null);

  squelchCatchHandlerFor = function squelchCatchHandlerFor(label) {
    squelchedLabels[label] = true;
  };

  unsquelchAllCatchHandlers = function unsquelchAllCatchHandlers() {
    squelchedLabels = Object.create(null);
  };
}

export default function(label, callback) {
  assert('ember-test-friendly-error-handler requires a label', label);
  if (!DEBUG) { return callback; }

  return function(reason) {
    if (squelchedLabels[label]) {
      return callback(reason);
    }

    return resolve(callback(reason))
      .then(() => {
        throw reason;
      });
  };
}

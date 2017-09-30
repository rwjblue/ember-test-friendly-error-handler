import { Promise } from 'rsvp';
import { test, module } from 'qunit';
import { DEBUG } from '@glimmer/env';
import catchGenerator, { squelchCatchHandlerFor, unsquelchAllCatchHandlers } from 'ember-test-friendly-catch-handler';

module('ember-test-friendly-catch-handler', function(hooks) {

  hooks.afterEach(() => {
    unsquelchAllCatchHandlers();
  });

  module('in debug', function() {
    if (!DEBUG) { return; }

    test('it calls the provided callback and rethrows the rejection', function(assert) {
      assert.expect(2);

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(catchGenerator('label-here', handler))
        .then(() => { assert.notOk(true, 'should have rejected'); })
        .catch(reason => {
          assert.equal(reason, rejectionReason, 'expected rejection reason was thrown');
        });
    });

    test('requires label', function(assert) {
      assert.throws(() => catchGenerator(null, () => {}), /requires a label/);
    });

    test('squelchCatchHandlerFor allows testing without rethrowing', function(assert) {
      assert.expect(2);

      squelchCatchHandlerFor('some-label-here');

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(catchGenerator('some-label-here', handler))
        .then(() => { assert.ok(true, 'does not reject'); });
    });

    test('squelched handlers can be cleared', function(assert) {
      assert.expect(2);

      squelchCatchHandlerFor('some-label-here');
      unsquelchAllCatchHandlers();

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(catchGenerator('some-label-here', handler))
        .then(() => { assert.notOk(true, 'should have rejected'); })
        .catch(reason => {
          assert.equal(reason, rejectionReason, 'expected rejection reason was thrown');
        });
    });
  });

  module('in prod', function() {
    if (DEBUG) { return; }

    test('it calls the provided callback', function(assert) {
      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason).catch(catchGenerator('some-thing', handler));
    });

    test('handler can decide to throw (who knows why)', function(assert) {
      let rejectionReason = {};
      function handler() {
        throw rejectionReason;
      }

      return Promise.reject('derp')
        .catch(catchGenerator('lol', handler))
        .catch((reason) => {
          assert.equal(reason, rejectionReason, 'expected rejection reason was thrown');
        })
    });
  });
});

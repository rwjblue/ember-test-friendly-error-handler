import { Promise } from 'rsvp';
import { test, module } from 'qunit';
import { DEBUG } from '@glimmer/env';
import buildErrorHandler, { squelchErrorHandlerFor, unsquelchAllErrorHandlers } from 'ember-test-friendly-error-handler';

module('ember-test-friendly-error-handler', function() {
  module('in debug', function(hooks) {
    if (!DEBUG) { return; }

    hooks.afterEach(() => {
      unsquelchAllErrorHandlers();
    });

    test('it calls the provided callback and rethrows the rejection', function(assert) {
      assert.expect(2);

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(buildErrorHandler('label-here', handler))
        .then(() => { assert.notOk(true, 'should have rejected'); })
        .catch(reason => {
          assert.equal(reason, rejectionReason, 'expected rejection reason was thrown');
        });
    });

    test('requires label', function(assert) {
      assert.throws(() => buildErrorHandler(null, () => {}), /requires a label/);
    });

    test('squelchErrorHandlerFor allows testing without rethrowing', function(assert) {
      assert.expect(2);

      squelchErrorHandlerFor('some-label-here');

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(buildErrorHandler('some-label-here', handler))
        .then(() => { assert.ok(true, 'does not reject'); });
    });

    test('squelched handlers can be cleared', function(assert) {
      assert.expect(2);

      squelchErrorHandlerFor('some-label-here');
      unsquelchAllErrorHandlers();

      let rejectionReason = {};
      function handler(reason) {
        assert.equal(reason, rejectionReason, 'expected rejection reason was passed to callback');
      }

      return Promise.reject(rejectionReason)
        .catch(buildErrorHandler('some-label-here', handler))
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

      return Promise.reject(rejectionReason).catch(buildErrorHandler('some-thing', handler));
    });

    test('handler can decide to throw (who knows why)', function(assert) {
      let rejectionReason = {};
      function handler() {
        throw rejectionReason;
      }

      return Promise.reject('derp')
        .catch(buildErrorHandler('lol', handler))
        .catch((reason) => {
          assert.equal(reason, rejectionReason, 'expected rejection reason was thrown');
        })
    });
  });
});

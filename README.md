# ember-test-friendly-error-handler

In production, you often want to catch certain types of errors such as network errors (e.g. `myModel.save().catch(() => this.showNetworkFailureMessage())`) however these kinds of generic catch handlers can wreak havoc on your tests.  In tests, _most_ of the time you want these uncaught errors to _actually_ fail your tests unless explicitly testing the generic catch handler behaviors (e.g. `this.showNetworkFailureMessage`).

## Installation

    ember install ember-test-friendly-error-handler

## Usage

In your application code you would import the error handler generator, and invoke it with a descriptive label and your callback.

### Ember.onerror

`Ember.onerror` is a hook that is invoked when an error is thrown by any code
within the Ember run loop (e.g. `{{action`'s, component event methods, model
hooks, etc). In practice, this is nearly all of your application code.
`Ember.onerror` has the ability to "swallow" errors by handling them without
rethrowing, and ultimately making the failure scenario impossible to detect
while testing.

It is common for applications to leverage `Ember.onerror` to do error reporting
and attempt to gracefully handle errors thrown within the application, and when
possible prevent those errors from bubbling out and causing issues with the
running application (or providing more detailed information when they do impact
the app).

Without something like `ember-test-friendly-error-handler`, applications that
implement `Ember.onerror` either have to replicate this addons behavior, or are
unable to properly test both the "production" (aka error swallowing) and
development/testing (aka re-throw errors to make them possible to track down
and fix).

Here is how an application might set this up:

```js
// app/app.js
import Ember from 'ember';
import buildErrorHandler from 'ember-test-friendly-error-handler';

Ember.onerror = buildErrorHandler('Ember.onerror', (reason) => {
  reportErrorToService(reason);
  // whatever else you might want here...
});
// ...existing `app/app.js` content goes here...
```

### Promises

To generate a promise rejection handler (aka `.catch` handler) you might do something like:

```js
import buildErrorHandler from 'ember-test-friendly-error-handler';

// ... snip ...
myModel.save()
  .catch(buildErrorHandler('save-my-model', () => this.showNetworkFailureMessage()));
```

### Testing

When you need to test the generic handler behavior (`this.showNetworkFailureMessage()` above), you need to disable the automatic error re-throwing behavior that `ember-test-friendly-error-handler` provides you so that your test more closely resembles your production environment.

A test that does this might look like:

```js
import { module, test } from 'qunit';
import { 
  squelchErrorHandlerFor,
  unsquelchAllErrorHandlers
} from 'ember-test-friendly-error-handler';

module('some good description', {
  afterEach() {
    unsquelchAllErrorHandlers();
  }
});

test('network failure message is displayed', function(assert) {
  squelchErrorHandlerFor('save-my-model');

  triggerNetworkFailure();         // ⚡️
  return triggerModelSave()
    .then(() => {
      assertNetworkFailureShown(); // 😼
    });
});
```

## API

The following interface describes the `ember-test-friendly-error-handler` module's API:

```ts
export default function(label: string, callback: Function): Function;

// the following are only present when testing
export function squelchErrorHandlerFor(label: string): void;
export function unsquelchAllErrorHandlers(): void;
```

## Contributing

### Installation

* `git clone <repository-url>` this repository
* `cd ember-test-friendly-error-handler`
* `npm install`


### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

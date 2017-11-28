# ember-test-friendly-error-handler

In production, you often want to catch certain types of errors such as network errors (e.g. `myModel.save().catch(() => this.showNetworkFailureMessage())`) however these kinds of generic catch handlers can wreak havoc on your tests.  In tests, _most_ of the time you want these uncaught errors to _actually_ fail your tests unless explicitly testing the generic catch handler behaviors (e.g. `this.showNetworkFailureMessage`).

## Installation

    ember install ember-test-friendly-error-handler

## Usage

In your application code you would import the catch generator, and invoke it with a descriptive label and your callback.
```js
import catchGenerator from 'ember-test-friendly-error-handler';

// ... snip ...
myModel.save()
  .catch(catchGenerator('save-my-model', () => this.showNetworkFailureMessage()));
```

When you need to test the generic handler behavior (`this.showNetworkFailureMessage()` above), you need to disable the automatic error re-throwing behavior that `ember-test-friendly-error-handler` provides you so that your test more closely resembles your production environment.

A test that does this might look like:

```js
import { module, test } from 'qunit';
import { 
  squelchCatchHandlerFor,
  unsquelchAllCatchHandlers
} from 'ember-test-friendly-error-handler';

module('some good description', {
  afterEach() {
    unsquelchAllCatchHandlers(); 
  }
});

test('network failure message is displayed', function(assert) {
  squelchCatchHandlerFor('save-my-model');

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
export function squelchCatchHandlerFor(label: string): void;
export function unsquelchAllCatchHandlers(): void;
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

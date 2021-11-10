import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | bakery', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /bakery', async function (assert) {
    await visit('/bakery');

    assert.equal(currentURL(), '/bakery');
  });
});

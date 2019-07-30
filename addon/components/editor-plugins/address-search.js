import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/address-search';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  layout,

  addressregister: service(),

  onInsert: null,

  init() {
    this._super(...arguments);

    if (this.searchText)
      this.search.perform(this.searchText);
  },

  search: task(function * (searchText) {
    this.set('internalSearchText', searchText);
    yield timeout(1000);
    const addresses = yield this.addressregister.suggest(searchText);
    return addresses;
  }).restartable(),

  updateAddress: task(function * (addressSuggestion) {
    const results = yield this.addressregister.findAll(addressSuggestion);

    let address = null;
    if (results.length >= 1) {
      // TODO offer options if multiple results
      address = results[0];
      this.onInsert(address);
    } else {
      warn(`No addresses found for suggestion: `, { id: 'address-search.address-not-found' });
    }
  }),

  actions: {
    openAdvancedSearch() {
      warn(`Advanced search not yet implemented`, { id: 'address-search.not-implemented' });
    }
  }

});

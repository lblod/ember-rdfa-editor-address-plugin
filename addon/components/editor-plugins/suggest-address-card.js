import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/suggest-address-card';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { warn } from '@ember/debug';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  layout,

  addressregister: service(),

  editor: reads('info.editor'),

  search: task(function * (searchText) {
    this.set('searchText', searchText);
    yield timeout(1000);
    const addresses = yield this.addressregister.suggest(searchText);
    return addresses;
  }).restartable(),

  insertAddress: task(function * (addressSuggestion) {
    const results = yield this.addressregister.findAll(addressSuggestion);

    let address = null;
    if (results.length >= 1) {
      address = results[0];
      this.insertAddressAtCurrentSelection(address);
      // TODO offer options if multiple results
    } else {
      warn(`No addresses found for suggestion: `, { id: 'suggest-address-card:address-not-found' });
    }

    this.closeHints();
  }),

  insertAddressAtCurrentSelection: function (address) {
    const selection = this.editor.selectCurrentSelection();
    this.editor.update(selection, {
      set: { // TODO 'add' should be better than 'set' once Pernet API supports innerHTML on 'add'
        typeof: 'https://data.vlaanderen.be/ns/adres#Adres',
        resource: address.uri,
        innerHTML: `${address.fullAddress}`
      }
    });
  },

  actions: {
    closeHints() {
      this.closeHints();
    },
    openAdvancedSearch() {
      warn(`Advanced search not yet implemented`, { id: 'not-implemented' });
    }
  }
});

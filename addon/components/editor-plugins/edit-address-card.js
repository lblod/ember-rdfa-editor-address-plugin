import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/edit-address-card';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';
import { warn } from '@ember/debug';

export default Component.extend({
  layout,

  addressregister: service(),

  hintsRegistry: reads('info.hintsRegistry'),
  hrId: reads('info.hrId'),
  who: reads('info.who'),
  editor: reads('info.editor'),
  location: reads('info.location'),
  currentAddress: reads('info.currentAddress'),

  search: task(function * (searchText) {
    this.set('searchText', searchText);
    yield timeout(1000);
    const addresses = yield this.addressregister.suggest(searchText);
    return addresses;
  }).restartable(),

  updateAddress: task(function * (addressSuggestion) {
    const results = yield this.addressregister.findAll(addressSuggestion);

    let address = null;
    if (results.length >= 1) {
      address = results[0];
      this.updateAddressInEditor(address);
      // TODO offer options if multiple results
    } else {
      warn(`No addresses found for suggestion: `, { id: 'suggest-address-card:address-not-found' });
    }

    this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);
  }),

  updateAddressInEditor: function (address) {
    const selection = this.editor.selectContext(this.location, {
      resource: this.currentAddress.uri,
      typeof: 'https://data.vlaanderen.be/ns/adres#Adres'
    });
    this.editor.update(selection, {
      set: {
        typeof: 'https://data.vlaanderen.be/ns/adres#Adres',
        resource: address.uri,
        innerHTML: `${address.fullAddress}`
      }
    });
  },

  actions: {
    openAdvancedSearch() {
      warn(`Advanced search not yet implemented`, { id: 'not-implemented' });
    }
  }
});

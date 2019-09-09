import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/autocomplete-address-card';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,

  hintsRegistry: reads('info.hintsRegistry'),
  hrId: reads('info.hrId'),
  who: reads('info.who'),
  editor: reads('info.editor'),
  location: reads('info.location'),
  searchText: reads('info.searchText'),

  actions: {
    insertAddressInEditor: function (address) {
      let updatedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      const selection = this.editor.selectHighlight(updatedLocation);
      this.editor.update(selection, {
        set: { // TODO 'add' should be better than 'set' once Pernet API supports innerHTML on 'add'
          typeof: 'https://data.vlaanderen.be/ns/adres#Adres',
          resource: address.uri,
          innerHTML: `${address.fullAddress}`
        }
      });
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);
    }
  }
});

import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/edit-address-card';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,

  hintsRegistry: reads('info.hintsRegistry'),
  hrId: reads('info.hrId'),
  who: reads('info.who'),
  editor: reads('info.editor'),
  location: reads('info.location'),
  currentAddress: reads('info.currentAddress'),

  actions: {
    updateAddressInEditor: function (address) {
      let updatedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      const selection = this.editor.selectContext(updatedLocation, {
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
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);
    }
  }
});

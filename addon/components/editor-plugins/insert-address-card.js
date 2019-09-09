import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/insert-address-card';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,

  hintsRegistry: reads('info.hintsRegistry'),
  hrId: reads('info.hrId'),
  who: reads('info.who'),
  editor: reads('info.editor'),
  location: reads('info.location'),
  instructive: reads('info.instructive'),

  actions: {
    insertAddressInEditor: function (address) {
      let updatedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      const selection = this.editor.selectContext(updatedLocation, {
        property: this.instructive
      });
      this.editor.update(selection, {
        remove: {
          property: this.instructive
        },
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

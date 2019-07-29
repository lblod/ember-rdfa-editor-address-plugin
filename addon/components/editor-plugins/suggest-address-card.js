import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/suggest-address-card';
import { reads } from '@ember/object/computed';

export default Component.extend({
  layout,

  editor: reads('info.editor'),

  actions: {
    closeHints() {
      this.closeHints();
    },
    insertAddressAtCurrentSelection: function (address) {
      const selection = this.editor.selectCurrentSelection();
      this.editor.update(selection, {
        set: { // TODO 'add' should be better than 'set' once Pernet API supports innerHTML on 'add'
          typeof: 'https://data.vlaanderen.be/ns/adres#Adres',
          resource: address.uri,
          innerHTML: `${address.fullAddress}`
        }
      });
      this.closeHints();
    }
  }
});

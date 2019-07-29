import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * Service responsible for correct annotation of addresses
 *
 * @module editor-address-plugin
 * @class RdfaEditorAddressPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorAddressPlugin = Service.extend({

  /**
   * Suggest hints at current position
  */
  async suggestHints(context, editor) {
    return [
      {
        component: 'editor-plugins/suggest-address-card',
        info: {
          editor: editor
        }
      }
    ];
  },

  /**
   * Task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  execute: task(function * (hrId, rdfaBlocks, hintsRegistry, editor) { // eslint-disable-line require-yield
    if (rdfaBlocks.length === 0) return;

    const cards = [];
    cards.pushObjects(this.generateHintsToEditAddress(hrId, rdfaBlocks, hintsRegistry, editor));

    if(cards.length > 0){
      hintsRegistry.addHints(hrId, this.who, cards);
    }
  }),

  generateHintsToEditAddress(hrId, rdfaBlocks, hintsRegistry, editor) {
    const who = this.who;

    const semanticNodes = rdfaBlocks.map(block => block.semanticNode);
    const uniqueSemanticNodes = [...new Set(semanticNodes)];

    function isRelevantContext(richNode) {
      return richNode.rdfaAttributes &&
        richNode.rdfaAttributes.typeof == 'https://data.vlaanderen.be/ns/adres#Adres';
    }

    function generateCard(richNode) {
      return EmberObject.create({
        info: {
          currentAddress: {
            uri: richNode.rdfaAttributes.resource,
            fullAddress: richNode.domNode.innerText
          },
          location: richNode.region,
          who: who,
          hrId, hintsRegistry, editor
        },

        location: richNode.region,
        options: {
          noHighlight: true
        },
        card: 'editor-plugins/edit-address-card'
      });
    }

    const cards = [];
    uniqueSemanticNodes.forEach((richNode) => {
      if (isRelevantContext(richNode)) {
        hintsRegistry.removeHintsInRegion(richNode.region, hrId, this.who);
        cards.push(generateCard(richNode));
      }
    });
    return cards;
  }
});

RdfaEditorAddressPlugin.reopen({
  who: 'editor-plugins/address-card'
});
export default RdfaEditorAddressPlugin;

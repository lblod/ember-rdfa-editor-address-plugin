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
    cards.pushObjects(this.generateHintsOnTyping(hrId, rdfaBlocks, hintsRegistry, editor));
    cards.pushObjects(this.generateHintsOnInstructive(hrId, rdfaBlocks, hintsRegistry, editor));

    if (cards.length > 0){
      hintsRegistry.addHints(hrId, this.who, cards);
    }
  }),

  /**
   * Show hints to edit existing addresses
   * Existing addresses are nodes annotated with 'typeof=adres:Adres'
  */
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
          who, hrId, hintsRegistry, editor
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
        hintsRegistry.removeHintsInRegion(richNode.region, hrId, who);
        cards.push(generateCard(richNode));
      }
    });
    return cards;
  },

  /**
   * Show hints on the text input entered by the user
   * Hints are shown in case:
   * - the user types 'op de ' in the context of besluit:Besluit
  */
  generateHintsOnTyping(hrId, rdfaBlocks, hintsRegistry, editor) {
    const who = this.who;
    const triggerWord = 'op de ';

    function isRelevantContext(rdfaBlock) {
      if (rdfaBlock.text && rdfaBlock.text.toLowerCase().indexOf(triggerWord) >= 0) {
         // TODO update RDF class
        return rdfaBlock.context.find(t => t.predicate == 'a' && t.object == 'http://data.vlaanderen.be/ns/besluit#Besluit');
      }
      return null;
    }

    function generateCard(rdfaBlock) {
      // TODO add to RDFa block class in Marawa
      rdfaBlock.normalizeRegion = function([relativeStart, relativeEnd]){
        return [this.start + relativeStart, this.start + relativeEnd];
      };

      const index = rdfaBlock.text.toLowerCase().indexOf(triggerWord) + triggerWord.length;
      const text = rdfaBlock.text.slice(index).trim();
      const location = rdfaBlock.normalizeRegion([index, index + text.length]);

      return EmberObject.create({
        info: {
          searchText: text,
          who, location, hrId, hintsRegistry, editor
        },

        location,
        card: 'editor-plugins/autocomplete-address-card'
      });
    }

    const cards = [];
    rdfaBlocks.forEach((rdfaBlock) => {
      if (isRelevantContext(rdfaBlock)) {
        hintsRegistry.removeHintsInRegion(rdfaBlock.region, hrId, who);
        cards.push(generateCard(rdfaBlock));
      }
    });
    return cards;
  },

  /**
   * Show hints on an instructive that indicates an address must be entered.
   * The instructive node will be used to set annotations on.
   * Currently supported instructives are:
   * - property=ext:insertAddress
  */
  generateHintsOnInstructive(hrId, rdfaBlocks, hintsRegistry, editor) {
    const who = this.wo;
    const instructive = 'http://mu.semte.ch/vocabularies/ext/insertAddress';

    const semanticNodes = rdfaBlocks.map(block => block.semanticNode);
    const uniqueSemanticNodes = [...new Set(semanticNodes)];

    function isRelevantContext(richNode) {
      return richNode.rdfaAttributes &&
        richNode.rdfaAttributes.property == instructive;
    }

    function generateCard(richNode) {
      return EmberObject.create({
        info: {
          instructive,
          location: richNode.region,
          who, hrId, hintsRegistry, editor
        },

        location: richNode.region,
        card: 'editor-plugins/insert-address-card'
      });
    }

    const cards = [];
    uniqueSemanticNodes.forEach((richNode) => {
      if (isRelevantContext(richNode)) {
        hintsRegistry.removeHintsInRegion(richNode.region, hrId, who);
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

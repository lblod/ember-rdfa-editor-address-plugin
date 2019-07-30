@lblod/ember-rdfa-editor-address-plugin
==============================================================================

RDFa editor plugin to insert an address in the editor.


Installation
------------------------------------------------------------------------------

```
ember install @lblod/ember-rdfa-editor-address-plugin
```


Usage
------------------------------------------------------------------------------

Currently the plugin adds the following features to your RDFa editor:
- insert of a new address at the current position/selection
- update of an existing address
- insert an address at an instructive
- autocomplete an address

The plugin inserts an address node annotated with a URI and a type. The full address will be shown in the text.

E.g.
```
<div typeof="https://data.vlaanderen.be/ns/adres#Adres" resource="https://data.vlaanderen.be/id/adres/216333">
    Kerkstraat 1, 1800 Vilvoorde
</div>
```

### Insert an address at the current position/selection
Click a button that makes the dispatcher call the `suggestHints` function of the plugin. The user can search and select an address the hint card. The address will be inserted at the current position in the editor or replace the current selected content in case of a selection.

### Update of an existing address
When putting the cursor in an address context, a hint card will be shown to modify the address. The user can search and select a new address in the hint card. The new address will replace the existing address in the editor.

### Insert an address at an instructive
A document may contain an instructive to insert an address. A hint card will be shown at the location of the instructive. The user can search and select an address in the hint card. The instructive will be replaced with the selected address.

Currently only one instructive property is supported:
```
<div property="http://mu.semte.ch/vocabularies/ext/insertAddress">Insert address here</div>
```

The plugin matches on the `property` attribute. The tag name, attributes, content, ... of the instructive node can be freely set.

### Autocomplete an address
While typing in a specific context, the plugin will show hints at locations where an address is expected based on the text entered by the user. The user can search and select an address in the hint card. The highlighted content will be replaced with the selected address.

Currently the plugin will show hints in the following cases:
- in context `besluit:Besluit` when the user types "op de "

Known issues
------------------------------------------------------------------------------
- Only isolated addresses can be inserted. They cannot be linked via a property to an existing context.
- Autocompleting an address inside an existing text will replace all text that follows after the address
- Addresses cannot be inserted at complex selections until supported by the Pernet API

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

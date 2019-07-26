import Service, { inject as service } from '@ember/service';

class AddressSuggestion {
  constructor({ id, street, housenumber, zipCode, municipality, fullAddress }) {
    this.adresRegisterId = id;
    this.street = street;
    this.housenumber = housenumber;
    this.zipCode = zipCode;
    this.municipality = municipality;
    this.fullAddress = fullAddress;
  }
}

class Address {
  constructor({ id, uri, street, housenumber, zipCode, municipality, fullAddress }) {
    this.uri = uri;
    this.adresRegisterId = id;
    this.street = street;
    this.housenumber = housenumber;
    this.zipCode = zipCode;
    this.municipality = municipality;
    this.fullAddress = fullAddress;
  }
}

export default Service.extend({
  ajax: service(),

  async suggest(query) {
    const results = await this.ajax.request(`/adressenregister/search?query=${query}`);
    const addressSuggestions = results.adressen.map( function(result) {
      return new AddressSuggestion({
        id: result.ID,
        street: result.Thoroughfarename,
        housenumber: result.Housenumber,
        zipCode: result.Zipcode,
        municipality: result.Municipality,
        fullAddress: result.FormattedAddress
      });
    });
    return addressSuggestions;
  },

  async findAll(suggestion) {
    const results = await this.ajax.request(`/adressenregister/match?municipality=${suggestion.municipality}&zipcode=${suggestion.zipCode}&thoroughfarename=${suggestion.street}&housenumber=${suggestion.housenumber}`);
    const addresses = results.map( function(result) {
      return new Address({
        uri: result.identificator.id,
        adresRegisterId: result.identificator.objectId,
        fullAddress: result.volledigAdres.geografischeNaam.spelling,
        street: suggestion.street,
        housenumber: suggestion.housenumber,
        zipCode: suggestion.zipCode,
        municipality: suggestion.municipality
      });
    });
    return addresses;
  }
});

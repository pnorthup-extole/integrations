
/**
 * Module dependencies.
 */

var reject = require('reject');
var is = require('is');

/**
 * Map identify `msg`.
 *
 * @param {Identify} msg
 * @return {Object}
 */

exports.identify = function(msg){
  return formatTraits(msg);
};

/**
 * Add the HelpScout traits
 *
 * http://developer.helpscout.net/customers/update/
 *
 * TODO:
 *
 *    - msg.companies('.name')[0] == .organization / .company / .companies[0].name
 *    - msg.gender()
 *    - msg.age() == .age / .birthdate / .birthday
 *    - msg.location()
 *    - msg.avatar()
 *    - msg.jobTitle()
 *    - msg.background() == .background / .description
 *    - msg.websites() == [.website] +/ .websites
 *    - msg.phones() == [.phone] ^ .phones
 *
 * @param  {Facade.Identify} identify
 * @return {Object}
 * @api private
 */

function formatTraits(identify){
  var organization = identify.proxy('traits.organization') ||
                     identify.proxy('traits.company');

  var traits = reject({
    gender       : identify.proxy('traits.gender'),
    age          : identify.proxy('traits.age'),
    location     : identify.proxy('traits.location'),
    photoUrl     : identify.proxy('traits.avatar') || identify.proxy('traits.photoUrl'),
    firstName    : identify.firstName(),
    lastName     : identify.lastName(),
    emails       : [{ value : identify.email() }],
    organization : organization,
    jobTitle     : identify.proxy('traits.jobTitle'),
    background   : identify.proxy('traits.background'),
    address      : formatAddress(identify),
    websites     : formatMultiple(identify, 'website', 'websites'),
    phones       : formatPhones(identify)
  });

  return traits;
}

/**
 * Look in the traits for the singular and plural field for an event
 *
 * @param {Identify} identify
 * @param {String}   singular  the singular string
 * @param {String}   plural
 * @return {Array}
 * @api private
 */

function formatMultiple (identify, singular, plural) {
  singular = identify.proxy('traits.' + singular);
  plural   = identify.proxy('traits.' + plural);

  if (singular) return [formatData(singular)];
  if (plural && is.array(plural)) return plural.map(formatData);
}

/**
 * Add location data to each item in the phones array
 *
 * @param {Identify} identify
 * @return {Array}
 * @api private
 */

function formatPhones(identify){
  var phones = formatMultiple(identify, 'phone', 'phones');
  if (!phones) return;
  if (!is.array(phones)) phones = [phones];

  phones.forEach(function (phone) {
    if (!phone.location) phone.location = 'mobile';
  });

  return phones;
}

/**
 * Formats an address for helpscout
 *
 * @param {Identify} identify
 * @return {Object}
 * @api private
 */

function formatAddress(identify){
  var address = identify.proxy('traits.address')
    , proxy   = 'traits';

  // Decide whether to reach into just traits or traits.address
  if (is.object(address)) proxy = 'traits.address';

  var zip     = identify.proxy(proxy + '.zip') || identify.proxy(proxy + '.postalCode')
    , city    = identify.proxy(proxy + '.city')
    , country = identify.proxy(proxy + '.country')
    , state   = identify.proxy(proxy + '.state')
    , street  = identify.proxy(proxy + '.street');

  if (!zip || !city || !country || !state || !street) return;

  var output = {
    city       : city,
    state      : state,
    postalCode : zip,
    country    : country,
    lines      : [street]
  };

  return output;
}

/**
 * Formats an array field for HelpScout
 *
 * http://developer.helpscout.net/customers/update/
 *
 * @param {Array} data
 * @return {Object}
 * @api private
 */

function formatData (data) {
  return {
    value : data
  };
}
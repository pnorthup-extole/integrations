
var del = require('obj-case').del;

/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(identify){

  // Outbound v1
  // TODO REMOVE
  if (this.settings.v1) {
    return {
      user_id: identify.userId() || identify.sessionId(),
      traits: identify.traits(),
      api_key: this.settings.apiKey,
    };
  }

  // Outbound v2

  var body = {
    user_id: identify.userId(),
    attributes: identify.traits(),
    email: identify.email(),
    phone: identify.phone(),
    first_name: identify.firstName(),
    last_name: identify.lastName()
  };

  var attrs = body.attributes;

  del(attrs, 'firstName');
  del(attrs, 'lastName');
  del(attrs, 'userId');
  del(attrs, 'phone');
  del(attrs, 'email');
  del(attrs, 'id');

  var token = identify.proxy('context.device.token');
  var platform = identify.proxy('context.library.name');
  if (!platform || !token) return body;

  if (platform.indexOf('android') > 0) body.gcm = [token];
  if (platform.indexOf('ios') > 0) body.apns = [token];

  return body;
};

/**
 * Map track.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track){

  // Outbound V1
  // TODO REMOVE
  if (this.settings.v1) {
    return {
      user_id: track.userId() || track.sessionId(),
      payload: track.properties(),
      api_key: this.settings.apiKey,
      event: track.event()
    };
  }

  // Outbound V2

  return {
    user_id: track.userId(),
    properties: track.properties(),
    event: track.event()
  };
};

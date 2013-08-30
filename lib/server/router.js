/*
 * router
 * handles routing from requests to responses
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( '../icarus' );

module.exports = (function() {
// Router
// Index route
icarus.server.get( '/', require( './routes/main' ) );



// Catch all
icarus.server.get( '*', require( './routes/main' ) );

})();
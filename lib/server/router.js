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


// Expose the routing functions
module.exports = (function() {
    // Index route
    icarus.server.get( '/', require( './routes/main' ) );

    // Do some shizzle
    icarus.server.get( '/test', require( './routes/test' ) );


    // Catch all
    icarus.server.get( '*', require( './routes/main' ) );

})();
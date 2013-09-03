/*
 * socket index
 * Handles the socket connection and pulls in other sockets
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Main icarus object
var icarus = require( './../../icarus' );

// Connection route - bootstraps the other socket routes
icarus.server.io.sockets.on( 'connection', function( socket ) {

    // Test socket include
    // @todo remove the requirement to pass in the socket
    require( './test' )( socket );

} );
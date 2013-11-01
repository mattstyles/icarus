/*
 * error
 * Handle some common errors
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

var icarus = require( './../icarus' );

module.exports = {

    // Handle common connection errors
    handleConnectionError: function( err ) {
        icarus.log.debug( 'Handling connection error'.error.bold );
        icarus.log.debug( JSON.stringify( err, null, '  ' ).error.bold );

        switch( err.code ) {
            case 'ECONNREFUSED':
                icarus.out( 'Check that icarus-server is running and ready to receive requests'.error.bold, 'error'.error );
                break;

            case 'ENOTFOUND':
                icarus.out( 'Check your connectivity'.error.bold, 'error'.error );
                break;

            default:
                // noop
                icarus.log.warn( 'Unhandled error: '.warn + err );
                break;
        }
    }

};
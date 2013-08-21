/*
 * router
 * Sets up the commander commands/options for the CLI
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( '../icarus' ),
    cmdr = require( 'commander' );

// export the routing function
// must be passed in the done callback to tell async when it is finished
module.exports = function( done ) {
    // Set up routes
    icarus.cmdr
        .version( icarus.config.get( 'version' ) )
        .option( '-q, --quiet', 'quiet mode - suppress logs')
        .option( '-v, --verbose', 'display more logs')
        .parse( process.argv );

    // Tell async we're good to go
    done();
};
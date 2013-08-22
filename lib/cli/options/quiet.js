/*
 * verbose
 * alters the log level to display more logs
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( './../../icarus' );


// Export the version info
module.exports = function() {
    icarus.out( 'calling '.info + 'quiet'.em );

    // Set up the logger to only display errors
    icarus.log
        .remove( icarus.log.transports.Console )
        .add( icarus.log.transports.Console, { level: 'error' } );

    // Test using the event system to control flow
    icarus.cmdr.emit( 'verbose' );
};
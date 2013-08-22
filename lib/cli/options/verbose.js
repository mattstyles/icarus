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
    icarus.out( 'calling '.info + 'verbose'.em );

    // Set up the logger
    icarus.log
        .cli();

    // For now just export the icarus object
//    icarus.log.warn( icarus );
    icarus.log.warn( 'from verbose' );
};
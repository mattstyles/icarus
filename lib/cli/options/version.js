/*
 * version
 * outputs the version and checks that icarus is up to date
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( './../../icarus' );


// Export the version info
module.exports = function() {
    // Output the current version
    icarus.out( 'version '.info + icarus.config.get('version').em );

    // Fire a request here to check for the latest version

    // Respond based on whether icarus is up-to-date
    // For now lets just output that it is
    icarus.out( 'up to date'.info );
};
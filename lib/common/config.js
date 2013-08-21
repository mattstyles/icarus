/*
 * config
 * describes an object that holds various config
 * config will initialise itself when it is required
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

// Includes
var fs = require( 'fs' ),
    path = require( 'path' );

// get icarus
var icarus = require( '../icarus' );


// Export the config object
module.exports = icarus.config || (function() {
    // Describe the config object
    var config = {
        version: 'not specified'
    }

    // Initialise the config object straight away
    var init = (function() {
        // Get the package info
        var pkg = fs.readFileSync( path.join( __dirname, '../../package.json'), 'utf8' );
        config.version = JSON.parse( pkg ).version || config.version;
    })();

    // Now that it is initialised, return the config object
    return config;
})();
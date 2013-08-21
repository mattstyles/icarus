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
    path = require( 'path' ),
    async = require( 'async' );

// get icarus
var icarus = require( '../icarus' );


// Export the config object
module.exports = icarus.config || (function() {
    // Describe the config object
    var config = {
        version: 'not specified'
    };

    // Expose public API
    return {
        // Initialise the config object straight away
        init: function( cb ) {

            // Start asynchronous creation of the config object
            async.parallel([

                // Get the package info
                function( done ) {
                    var pkg = fs.readFileSync( path.join( __dirname, '../../package.json'), 'utf8' );
                    config.version = JSON.parse( pkg ).version || config.version;

                    done();
                }

            ],
            function( err, res ) {
                // Handle any errors here -- @todo handle these properly
                if ( err ) {
                    console.log( 'Config.init: '.error + err );
                }

                // Expose config to icarus
                icarus.config = config;

                // Now fire the callback to proceed
                cb();
            });
        }
    }

})();
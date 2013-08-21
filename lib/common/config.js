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

    // Asynchronously get the package info
    var getPkg = function( done ) {
        fs.readFile( path.join( __dirname, '../../package.json'), function( err, res ) {
            // Pass the error to the end function and handle it there
            if ( err ) {
                done( 'error reading package.json' );
                return;
            }

            // Set the config
            config.version = JSON.parse( res ).version || config.version;

            // Return success
            done();
        } );
    };

    // Expose public API
    return {
        // Initialise the config object straight away
        init: function( done ) {

            // Start asynchronous creation of the config object
            async.parallel([

                // Get the package info
                getPkg

            ],
            function( err, res ) {
                // Handle any errors here -- @todo handle these properly
                if ( err ) {
                    console.log( 'Config.init - async error: '.error + err );
                }

                // Expose config to icarus
//                icarus.config = config;   // Dont do this

                // Now fire the callback to proceed
                done();
            });
        },

        // Getter
        // Returns null if the property does not exist
        get: function( prop ) {
            if ( config.hasOwnProperty( prop ) ) {
                return config[prop];
            }
            return null;
        }
    }

})();
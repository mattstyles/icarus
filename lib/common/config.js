/*
 * config
 * describes an object that holds various config
 * config will initialise itself when it is required
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

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
        version: 'not specified',
        format: {
            margin: 10,
            def: 'icarus'
        },
        dir: {
            main: '.icarus',
            deploy: 'www',
            logs: 'logs'
        },
        excludeDir: /\/node_modules/
    };

    // Asynchronously get the package info
    var getPkg = function( done ) {
        fs.readFile( path.join( __dirname, '../../package.json'), function( err, res ) {
            // Pass the error to the end function and handle it there
            if ( err ) {
                done( 'error reading package.json' );
                return;
            }

            var data = JSON.parse( res );

            // Set the config
            config.version = data.version || config.version;

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
        // Supplying an empty string or no parameter will return the config
        // Returns null if the property does not exist
        get: function( prop ) {
            if ( !prop ) {
                return config;
            }

            // Split prop into nest levels to search through
            var props = prop.split('.'),
                i = 0,
                item = config;

            // Iterate through props checking that the property exists on the object and
            // updating the object to search through the nest levels
            // returns null when the property is not found
            while( props[i] ) {
                if ( item.hasOwnProperty( props[i] ) ) {
                    item = item[ props[i] ];
                } else {
                    return null;
                }

                i = i + 1;
            }

            // If we got here then we found the item so return it
            return item;
        }
    };

})();
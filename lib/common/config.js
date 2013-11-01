/*
 * config
 * describes an object that holds various config
 * config will initialise itself when it is required
 * config is read only but the external config file used by icarus is mutable
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var fs = require( 'fs' ),
    path = require( 'path' ),
    async = require( 'async' ),
    _ = require( 'underscore' );

// get icarus
var icarus = require( '../icarus' );


// Export the config object
module.exports = icarus.config || (function() {
    // Describe the config object
    var config = {
        // For versioning icarus - will check with the latest on use and prompt for an update if necessary
        version: 'not specified',

        // Formatting for output strings
        format: {
            margin: 10,
            def: 'icarus'
        },

        // Default directories for stuff
        dir: {
            main: '.icarus',
            conf: 'icarus.conf',
            deploy: 'www',
            logs: 'logs',
            tmp: 'tmp'
        },

        // Excluded from being a candidate for project root, if icarus is invoked from within these directories
        // then it'll pass through and keep looking for root (where package.json lives)
        excludeDir: /\/node_modules/,

        // Server info
        server: {
            protocol: 'http://',
            host: 'localhost',
            port: '8080'
        },

        // Identifies a deploy from a built folder
        buildID: /\/dist$|\/prod$/,

        // Sets the current log level
        loglevel: icarus.utils.loglevel.NORMAL
    };

    // Asynchronously get the package info for icarus
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

        // Extends the config object
        extend: function( data ) {
            // data should be specified as an object, even if it is just blank
            if ( typeof data !== 'object' ) {
                icarus.log.warn( 'Error extending config object - using '.info + 'default config'.em );
                return;
            }

            _.extend( config, data );
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
        },

        // Create
        // Creates a config file at the specified path with the specified data and calls the callback
        // with an error and data object.
        // Function arity is mutable:
        // create( cb ),
        // create( {}, cb ),
        // create( 'path/to/file', {}, cb )
        // are all valid invocations
        create: function( filename, data, cb ) {
            // Check the arity to work out how the function was called
            // If the first param was a function then assume it is the promise callback
            if ( typeof filename === 'function' ) {
                icarus.config.create( {}, filename );
                return;
            }
            // If the first param is an object and the 2nd is a function then assume no filename was specified
            if ( typeof filename === 'object' && typeof data === 'function' ) {
                // Use default position for the config file
                var file = path.join( icarus.utils.getHome(), config.dir.main, config.dir.conf );
                icarus.config.create( file, filename, data );
                return;
            }
            // If no callback was passed then bail
            if ( typeof cb === 'undefined' || typeof cb === 'null' ) {
                icarus.log.error( 'Error creating config file - incorrect parameters'.error );
                process.exit(0);
            }

            // Create functions we need to create the config
            // Write the object to the config file
            function createConf() {
                fs.writeFile( filename, JSON.stringify( data, null, '  ' ), function( err ) {
                    if ( err ) {
                        // Handle file write error
                        icarus.log.error( 'Error creating config file: ' + err );
                        cb( ' ERROR: Error creating config file' + err );
                    }

                    icarus.out( 'Config file created at '.info + filename.em );
                    cb( null, data );
                });
            }

            // If we got here then assume function arity is correct so start populating the config object
            icarus.prompt( [ 'username' ], function( res ) {
                // Include the prompted data inside the data passed in
                _.extend( data, res );
                createConf();
            }, function( err ) {
                icarus.log.error( 'Error processing input to create the config file'.error );
                process.exit(0);
            });
        },

        // Setter
        // This sets local config options just for this run of the cli
        set: function( data ) {
            if ( typeof data !== 'object' ) {
                icarus.log.warn( 'Data not set: '.info + data.em );
                return;
            }

            _.extend( config, data );
        },

        // Setter - asynchronous
        // This setter method is only for the external config file
        setFile: function( data, cb ) {
            var filename = path.join( icarus.utils.getHome(), config.dir.main, config.dir.conf );

            icarus.utils.getConf( function( err, res ) {
                if ( err ) {
                    icarus.log.error( 'Can not set config file: ' + err );
                    return;
                }

                // Extend the current config file with the new data
                // New data will over-ride old properties on res
                fs.writeFile( filename, JSON.stringify( _.extend( res, data ), null, '  ' ),  cb );
            });
        }
    };

})();
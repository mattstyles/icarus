/*
 * logger
 * Use winston for the logs
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

var icarus = require( './../icarus' ),
    winston = require( 'winston' ),
    _ = require( 'underscore' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    path = require( 'path' );



// Logging extension functions
// Extends winston with these functions, for project specific stuff like setup, tear down etc
var logger = {
    // Options object for specifying the file transport
    logOpts: {
        filename: path.resolve( icarus.utils.getHome(), '.icarus/logs', 'icarus.log'),
        level: 'debug'
    },

    // Work out the log file to use
    // Logs should be project specific as well as a generic log for icarus/server stuff
    // The log file lives inside a log folder inside the main .icarus folder.  The log folder matches the name of the
    // project it is logging for.  Currently no name checking occurs so projects with the same name will end up sharing
    // logging space.
    initLogFile: function( done ) {
        // Hold the project name
        var projectName = '';

        // Get the project name
        icarus.utils.findProjectRoot( function( dir ) {
            //  If no directory was found then this is not a project directory so use default log
            if ( !dir ) {
                logger.setLogFile( done );
                return;
            }

            // If we got here then use the package name to identify the log folder
            async.series([
                // Get the package name
                function( cb ) {
                    fs.readFile( path.join( dir, 'package.json' ), function( err, res ) {
                        if ( err ) {
                            // Handle this error
                            // For now just log an error but we should probably exit
                            icarus.log.warn( 'No package.json found at root -- using default log file' );
                            cb();
                        }

                        icarus.log.debug( 'Found package.json for the project' );
                        projectName = icarus.utils.parsePkgName( JSON.parse( res ).name ) || '';
                        icarus.out( 'Project Name: '.info + projectName.em );
                        cb();
                    });
                },
                // Check that there is a folder to receive the logs for this project
                function( cb ) {
                    // Check if the log file exists
                    fs.exists( path.resolve( icarus.utils.getHome(), '.icarus/logs', projectName ), function( found ) {
                        // If the folder does not exist then create it
                        if ( !found ) {
                            fs.mkdir( path.resolve( icarus.utils.getHome(), '.icarus/logs', projectName ), function( err, res ) {
                                if ( err ) {
                                    icarus.log.error( 'Error creating log folder for this project - ' + projectName );
                                    cb();
                                    return;
                                }

                                icarus.out( 'Creating log folder for project: '.info + projectName.em );

                                // Update the log option file
                                logger.logOpts.filename = path.resolve( icarus.utils.getHome(), '.icarus/logs', projectName, projectName + '.log');

                                // all done and the log option file and folder should be ready to start logging
                                cb();
                                return;
                            });

                            // If it was not found then flow continues inside mkdir so return from here
                            return;
                        }

                        icarus.out( 'Setting log folder: '.info + projectName.em );

                        // Update the log option file
                        logger.logOpts.filename = path.resolve( icarus.utils.getHome(), '.icarus/logs', projectName, projectName + '.log');

                        // all done and the log option file and folder should be ready to start logging
                        cb();
                    });
                }
            ], function( err, res ) {
                if ( err ) {
                    icarus.log.warn( 'Error setting the log folder' );
                }

                icarus.log.debug( 'Log file ready' );

                // Set the log file and call done to finish the async that called this function
                logger.setLogFile( done );
            });

        } );
    },

    // Set the file logger using the log object
    // Console transport is added as a winston default and should already have been added when the logger was created
    setLogFile: function( done ) {
        icarus.log.add( icarus.log.transports.File, logger.logOpts );

        icarus.log.debug('Setting log file ' + logger.logOpts.filename );  // This seems to be necessary for updating the logs
        done();
    }
};

// Export the logger and extension functions
module.exports = (function() {
    // Return the basic winston console logger and augment with custom logging object
    _.extend( winston, logger);
    return winston;

})();

// > The deploy post route.
// > Removes previous deploy if it exists.
// > Accepts a tarball, unpacks it and puts it in the right place.
//
// > Copyright  ©  2013 Matt Styles
// > Licensed under the MIT license


'use strict';

// Includes
var icarus = require( '../../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' ),
    exec = require( 'child_process' ).exec,
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' ),
    async = require( 'async' ),
    rimraf = require( 'rimraf' );

// Export the test route
module.exports = function( req, res ) {
    // Store the archive folder.<br>
    // @todo should be in the config.
    var archiveFolder = '.icarus/archive/';

    // Get some info about the transfer
    var reqData = {
        start: new Date(),
        projectName: req.query.pkgName,
        tmpName: req.query.tmpName.match( /[^\/]+$/ )[0]
    };
    reqData.tmpPath = path.join( icarus.utils.getHome(), archiveFolder, reqData.tmpName );

    // Create the deploy path
    var deployPath = path.join( icarus.utils.getHome(), icarus.config.get( 'dir.main' ), icarus.config.get( 'dir.deploy' ), reqData.projectName );

    // Remove a pre-existing deploy of the project
    var removeProject = function( done ) {
        fs.exists( deployPath, function( exists ) {
            // If a previous deploy exists then remove it
            if ( exists ) {
                icarus.log.info( 'Removing previous deploy of '.grey + reqData.projectName.yellow.bold );

                // Remove the previous project directory
                rimraf( deployPath, function( err ) {
                    if ( err ) {
                        icarus.log.info( 'An error occurred removing a previous deploy : '.red + err );
                        return;
                    }

                    icarus.log.info( 'Previous deploy '.grey + 'removed'.yellow.bold );
                    done();
                });
            } else {
                // If no previous deploy then log it
                icarus.log.info( 'No previous deploy to remove'.grey );

                // Inform async we are finished
                done();
            }
        });
    };

    // Build Step
    // ---

    // Call exec to do the heavy lifting of an npm install
    var npmInstall = function( cb ) {
        // Create the child process
        var child = exec( 'npm install', { cwd: deployPath }, function( err, stdout, stderr ) {
            // Handle an error
            if ( err ) {
                icarus.log.error( 'Error occurred building project : ' + err );
            }

            // Call the callback now that the child is finished
            cb();
        });

        // Handle output from the child to stdout
        child.stdout.on( 'data', function( chunk ) {
            util.print(chunk);
        });

        // Npm uses stderr for the bulk of the output
        child.stderr.on( 'data', function( chunk ) {
            util.print( chunk );
        });
    }

    // For now just manually trigger an npm install for when deploying from a built folder
    // (denoted by `/prod/` or `/dist/`)
    var buildProject = function( cb ) {
        // See if we need to build this deploy
        if ( req.query.build ) {
            icarus.log.info( 'Attempting to build the project'.grey );

            // Start a child process to handle the npm install
            npmInstall( cb );
        } else {
            // Otherwise just call the callback as we are done
            cb();
        }
    };


    // Deploy Step
    // ---
    icarus.log.info( 'Attempting to deploy '.grey + reqData.projectName.yellow.bold + ' tarball into '.grey + deployPath.yellow.bold );

    // Do some maintenance work before piping the request object into the deploy folder
    async.series([
        removeProject
    ], function( err, result ) {
        if ( err ) {
            icarus.log.error( '\nError deploying ' + reqData.projectName + ' : ' + err );
        }

        // Extract the request into the correct directory
        req
            .pipe( zlib.Unzip() )
            .pipe( tar.Extract( {
                path: deployPath,
                strip: true
            }))
                .on( 'error', function( err ) {
                    icarus.log.info( '\nDeployment'.grey + ' unsuccessful'.red.bold );
                    icarus.log.debug( 'The following error occurred while trying to deploy ' + reqData.projectName );
                    icarus.log.debug( err );
                    res.send( { "status": "something went horribly, horribly wrong" } );
                    return;
                })
                .on( 'end', function () {
                    // Do a basic speed check and record it
                    var endTime = new Date();
                    icarus.log.info( 'Time taken to deploy: '.grey + ( icarus.utils.timeFormat( endTime - reqData.start ) ).toString().yellow.bold );

                    buildProject( function() {
                        icarus.log.info( 'Deployment'.grey + (reqData.projectName ? ' of '.grey + reqData.projectName.yellow.bold  : '') + ' ...'.grey + 'successful'.green.bold  );
                        res.send( { "status": "deployed" } );
                    } );
                });

        // Write the tarball into an archive directory
        req
            .pipe( fstream.Writer( path.join( icarus.utils.getHome(), archiveFolder, reqData.tmpName ) ) )
            .on( 'ready', function() {
                icarus.log.info( 'Writing archive to '.grey + reqData.tmpPath.yellow.bold );
            })
            .on ('error', function( err ) {
                icarus.log.error( 'Error storing archive : ' + err );
            })
            .on( 'close', function() {
                icarus.log.info( 'finished writing to archive'.grey );
            });

    });


};
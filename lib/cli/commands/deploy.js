// > The deploy command tars up a directory and streams it to the server
//
// > Copyright  ©  2013 Matt Styles
// > Licensed under the MIT license


'use strict';

// Includes.
var icarus = require( './../../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' ),
    exec = require( 'child_process').exec,
    request = require( 'superagent' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' );


// Expose the deployment route.
module.exports = (function() {

    //
    // Members
    // -------

    // Set the path data -- hardcode for now.<br>
    // @todo grab this from the config.
    var route = {
        host: 'http://localhost',
        port: '8080',
        path: 'deploy'
    }

    // Store this here for now.<br>
    // @todo sort out encapsulation properly.
    var dirSize = 0;
    var progressBar = null;

    // Store the local tmp folder.<br>
    // @todo should be in the config.
    var tmpFolder = '.icarus/tmp/';

    //
    // Methods
    // -------

    // Handle returning an invalid folder.
    // An invalid folder is one that does not contain a `package.json`.
    var onInvalidFolder = function( dir ) {
        icarus.log.info( 'An error occurred finding the project root' );
        icarus.log.error( process.cwd() + ' is not a valid folder' );
    };


    // Handle finding a valid project folder.
    var onProjectFolder = function( dir ) {
        // Read the package and pass to the main create tar function
        fs.readFile( path.join( dir, 'package.json' ), function( err, res ) {
            if ( err ) {
                // Handle this error.
                // For now just log an error but we should probably exit.
                icarus.log.warn( 'No package.json found at root -- using default log file' );
                process.exit();
            }

            icarus.log.debug( 'Found package.json for the project'.info );
            icarus.out( 'Valid project directory - '.info + 'package.json '.em + 'found'.info );

            // Parse the package, we'll need stuff from it
            var pkg = JSON.parse( res );

            // Create the tarball and send it to the server
            createTar( dir, pkg, sendToRemote );
        });
    };

    // This function serves two purposes -
    // it reads the directory and stores its size and,
    // it creates an archive of the directory.
    var createTar = function( dir, pkg, cb ) {
        var timestamp = new Date();

        // Create archive name
        var archiveName = pkg.name + '-v' + pkg.version + '-' + timestamp.toJSON() + '.tar.gz';

        // Reads the directory and stores the number of files.
        // Gzip the archive.
        // The number of files are used as a reference to to measure the progress of the deployment.
        var fileReader = fstream.Reader( { path: dir, type: 'Directory' } )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error reading directory : ' + err );
            })
        .pipe( tar.Pack() )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error packing the directory into the archive tarball : ' + err );
            })
        .pipe( zlib.createGzip() )
            .on( 'error', function() {
                icarus.log.error( 'Error gzipping the directory : ' + err );
            })
        .pipe( fstream.Writer( path.join( icarus.utils.getHome(), tmpFolder, archiveName ) ) )
            .on ('error', function( err ) {
                icarus.log.error( 'Error storing tmp tar : ' + err );
            })
            .on( 'close', function() {
                icarus.out( 'finished writing to tmp'.verbose );

                // Finished reading the directory so hit the callback.
                cb( path.join( icarus.utils.getHome(), tmpFolder, archiveName ), pkg );
            });
    };

    // Tar up the folder
    var sendToRemote = function( tmpPath, pkg ) {
        // Create request object
        var req = request
                    .post( route.host + ':' + route.port + '/' + route.path )
                    .type("binary")
                    .query( { pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified',
                              tmpName: tmpPath || 'not specified' } )
                    .on( 'error', function( err ) {
                        icarus.log.error( 'there was an error streaming the deploy' );
                    })
                    .on( 'response', function( res ) {
                        icarus.out( res.body.status.em, 'deploy status' );
                    });

        // Output starting deploy
        icarus.out( 'Starting deployment of tarball'.verbose );

        // Read the directory, tar it up and send through the request object
        fstream.Reader( { path: tmpPath, type: 'File' } )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error reading tmp file' );
            })
            .on( 'end', function() {
                // Print a line break for better human-readable feedback after the progress ticker finishes
                icarus.out( '', null );
            })
        // Should this be piped into a stream to convert to base64?
        .pipe( req )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error piping to the request' );
            });
    };

    // Return the route function
    return function( opts ) {
        // Find the project root and deploy that folder
        icarus.out( 'Attempting to deploy from '.info + process.cwd().em );
        icarus.utils.findProjectRoot( onInvalidFolder, onProjectFolder );
    };
})();
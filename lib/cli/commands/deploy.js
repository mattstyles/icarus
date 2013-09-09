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
    ProgressBar = require( 'progress' ),
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

    // Store the local archive folder.<br>
    // @todo should be in the config.
    var archiveFolder = '.icarus/archive/';

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

            var pkg = JSON.parse( res );

            // Tar the current folder.
            // Currently also pipes the file into the request object sent to the server.
            createArchive( dir, pkg, function() {
                sendToRemote( dir, pkg );
            });
        });
    };

    // This function serves two purposes -
    // it reads the directory and stores its size and,
    // it creates an archive of the directory.
    var createArchive = function( dir, pkg, cb ) {
        var count = 0,
            timestamp = new Date();

        // Create archive name
        var archiveName = pkg.name + '-v' + pkg.version + '-' + timestamp.toJSON() + '.tar.gz';

        // Reads the directory and stores the number of files.
        // The number of files are used as a reference to to measure the progress of the deployment.
        fstream.Reader( { path: dir, type: 'Directory' } )
            .on( 'entry', function( e ) {
                count = count + 1;
            })
            .on( 'end', function( e ) {
                // Store the size of the directory in files and create the
                // _progressBar_ object.
                dirSize = count;
                progressBar = {
                    ticks: 20,
                    count: 0,
                    total: dirSize,
                    chunk: dirSize / 20,
                    num: 0,
                    diff: 0,
                    tick: function( len ) {
                        this.num = len / this.total * this.ticks;
                        this.diff = this.num - this.count;
                        for ( var x = 0; x < this.diff; x++ ) {
                            util.print( '.'.info );
                        }
                        this.count = this.num;
                    }
                }

                // Finished reading the directory so hit the callback.
                cb();
            })
        .pipe( tar.Pack() )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error packing the directory into the archive tarball' );
            })
        .pipe( fstream.Writer( path.join( icarus.utils.getHome(), archiveFolder, archiveName ) ) )
            .on ('error', function( err ) {
                icarus.log.error( 'Error storing archive' );
            })
            .on( 'end', function() {
                icarus.out( 'finished writing to archive' );
            });
    };

    // Tar up the folder
    var sendToRemote = function( dir, pkg ) {
        // Create request object
        var req = request
                    .post( route.host + ':' + route.port + '/' + route.path )
                    .type("binary")
                    .query( { pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified' } )
                    .on( 'error', function( err ) {
                        icarus.log.error( 'there was an error streaming the deploy' );
                    })
                    .on( 'response', function( res ) {
                        icarus.out( res.body.status.em, 'deploy status' );
                    });

        // Progress count
        var count = 0;

        // Output starting deploy
        icarus.out( 'Starting deployment of tarball'.verbose );

        // Read the directory, tar it up and send through the request object
        fstream.Reader( { path: dir, type: 'Directory' } )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error reading directory' );
            })
            .on( 'entry', function( data ) {
                // Increase the read file count and update the progress ticker
                count = count + 1;
                progressBar.tick( count );
            })
            .on( 'end', function() {
                // Print a line break for better human-readable feedback after the progress ticker finishes
                icarus.out( '', null );
            })
        .pipe( tar.Pack() )
            .on( 'error', function( err ) {
                icarus.log.error( 'Error packing the directory into tarball' );
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
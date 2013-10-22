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
    Progress = require( 'progress' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' ),
    io = require( 'socket.io-client' ),
    _ = require( 'underscore' );


// Expose the deployment route.
module.exports = (function() {

    //
    // Members
    // -------

    // Set the path data to the server
    var route = _.extend(
        icarus.config.get( 'server' ), {
        path: 'deploy'
    } );

    // Size of directory being deployed and progressBar object for node-progress
    var dirSize = 0;
    var progressBar = null;

    // Stuff for identifying a built folder deploy
    var builtFolder = false;
    var buildID = icarus.config.get( 'buildID' );

    // Local tmp folder
    var tmpFolder = path.resolve( icarus.utils.getHome(), icarus.config.get( 'dir.main' ), icarus.config.get( 'dir.tmp' ) );

    // Route options
    var opts = null;
    var pkg = null;

    // Create socket connection
    var socket = io.connect( 'http://localhost:8080' );

    // Create socket events
    socket.on( 'build', function( data ) {
        icarus.out( data.data.em, 'building' );
    });

    socket.on( 'buildstep', function( data ) {
        icarus.out( data.data.replace( /\n$/, '').yellow, 'building' );
    });

    socket.on( 'deployed',function( data ) {
        icarus.out( 'Deployed to server'.verbose, 'deploying' );
    });



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
                icarus.log.warn( 'No package.json found at root' );
                process.exit();
            }

            icarus.log.debug( 'Found package.json for the project'.info );
            icarus.out( 'Valid project directory - '.info + 'package.json '.em + 'found'.info );

            // Parse the package, we'll need stuff from it
            pkg = JSON.parse( res );

            // Pass exec to router
            optsRouter( dir );
        });
    };

    // The router for the deploy command
    // Checks options and proceeds appropriately
    var optsRouter = function( dir ) {
        // Github deploy route
        if ( opts.git ) {
            // Check the package for a valid repository field
            validateRepoInfo( deployFromGit, onInvalidRepo );

            return;
        }

        // Create the tarball and send it to the server
        icarus.out( 'Attempting to deploy from '.info + path.resolve( dir ).em );
        createTar( dir, pkg, sendToRemote );
    };



    //
    // Github Deploy Methods
    // ---------------------



    // Validate the package for the info required for a github deploy
    var validateRepoInfo = function( onSuccess, onFailure ) {
        // Check for a repository field
        if ( !pkg.repository ) {
            onFailure();
            return;
        }

        var validRepoInfo = [
            'type',
            'branch',
            'url'
        ];

        // Check the package info for git info
        if ( !icarus.utils.contains( _.keys( pkg.repository ), validRepoInfo ) ) {
            onFailure();
            return;
        }

        // If we got here then hit up the success route
        onSuccess();
    };

    // Return a message if the package does not contain relevant repository information
    var onInvalidRepo = function() {
        icarus.out( 'Invalid Repository Information'.error, 'deploying' );
    };

    // The main function to kickstart deploying from a github branch
    // @todo this is a stub for now
    var deployFromGit = function() {
        icarus.out( [
            'Attempting to deploy from '.info,
            pkg.repository.url.em,
            ':'.info,
            pkg.repository.branch.em
        ].join(''), 'deploying' );
    };



    //
    // Local Deploy Methods
    // --------------------



    // This function serves two purposes -
    // it reads the directory and stores its size and,
    // it creates an archive of the directory.
    var createTar = function( dir, pkg, cb ) {
        var timestamp = new Date();

        // Check for a built folder
        if ( dir.match( buildID ) ) {
            icarus.log.debug( 'Deploying built artefact'.info );
            builtFolder = true;
        }

        // Create archive name
        var archiveName = pkg.name + '-v' + pkg.version + '-' + timestamp.toJSON() + '.tar.gz';
        icarus.log.debug( 'Archiving as '.info + archiveName.em );
        var archive = path.join( icarus.utils.getHome(), tmpFolder, archiveName );

        icarus.out( 'Creating tarball'.verbose, 'deploying' );

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
        .pipe( fstream.Writer( archive ) )
            .on ('error', function( err ) {
                icarus.log.error( 'Error storing tmp tar : ' + err );
            })
            .on( 'close', function() {
                icarus.out( 'Finished packing tarball'.verbose, 'deploying' );

                // Finished reading the directory so hit the callback.
                cb( archive, pkg );
            });

    };

    // Tar up the folder
    var sendToRemote = function( tmpPath, pkg ) {
        var bar = null,
            size = 0;

        // Create request object
        var req = request
                    .post( route.host + ':' + route.port + '/' + route.path )
                    .type("binary")
                    .query( { pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified',
                              tmpName: tmpPath || 'not specified' } )
                    .on( 'error', function( err ) {
                        icarus.log.error( 'There was an error streaming the deploy : ' + err );
                    })
                    .on( 'response', function( res ) {
                        icarus.out( 'Time taken to deploy - '.info + res.body.deployTime.em, 'stats' );
                        icarus.out( 'Time taken to build  - '.info + res.body.buildTime.em, 'stats' );
                        icarus.out( res.body.status.em, 'deploy status' );

                        // Manually close as the socket connection will keep the program running
                        process.exit(0);
                    });

        // Tell the server this needs building
        if ( !builtFolder ) {
            icarus.log.debug( 'Sending '.info + 'build '.verbose + 'query to trigger build tasks'.info );
            req.query( { build: 'true' } );
        }

        // Output starting deploy
        icarus.out( 'Starting deployment of tarball'.verbose, 'deploying' );

        // Read the directory, tar it up and send through the request object
        fs.stat( tmpPath, function( err, stat ) {
            // Handle an error - most likely a file not found error
            if ( err ) {
                icarus.log.error( 'Error statting the temp deploy artifact : ' + err );
            }

            fstream.Reader( { path: tmpPath, type: 'File' } )
                .on( 'error', function( err ) {
                    icarus.log.error( 'Error reading tmp file' );
                })
                .on( 'open', function() {
                    // Create the progress bar
                    size = stat.size;
                    bar = new Progress( 'uploading [:bar] :percent', {
                        complete    : '=',
                        incomplete  : '-',
                        width       : 30,
                        total       : stat.size
                    });

                })
                .on( 'data', function( chunk ) {
                    // Update the progress bar
                    if ( bar ) {
                        bar.tick( chunk.length > size ? size : chunk.length );
                    }
                })
                .on( 'end', function() {
                    icarus.out( 'Finished sending tarball'.verbose, 'deploying' );
                })
            // Should this be piped into a stream to convert to base64?
            .pipe( req )
                .on( 'error', function( err ) {
                    icarus.log.error( 'Error piping to the request' );
                });
        });
    };

    // Return the route function
    return function( options ) {
        // Set the options
        opts = options;

        // Check that this is a valid project folder and proceed or stop
        icarus.utils.findProjectRoot( onInvalidFolder, onProjectFolder );
    };
})();
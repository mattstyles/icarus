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
    async = require( 'async' ),
    exec = require( 'child_process').exec,
    request = require( 'request' ),
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
    var dirSize = 0,
        progressBar = null;

    // Stuff for identifying a built folder deploy
    var builtFolder = false,
        buildID = icarus.config.get( 'buildID' );

    // Local tmp folder
    var tmpFolder = path.resolve( icarus.utils.getHome(), icarus.config.get( 'dir.main' ), icarus.config.get( 'dir.tmp' ) );

    // Route options
    var opts = null,
        pkg = null,
        root = '';

    // Create socket connection
    var socketPath = route.protocol + route.host + ':' + route.port,
        socket = io.connect( socketPath );

    // Create socket events
    socket.on( 'build', function( data ) {
        icarus.out( data.data.em, 'building' );
    });

    socket.on( 'buildstep', function( data ) {
        if ( icarus.config.get( 'loglevel' ) > icarus.utils.loglevel.QUIET ) {
            icarus.out( data.data.replace( /\n$/, '').yellow, 'building' );
        }
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
        // Store the directory path
        root = dir;

        // Grab the package and config file info
        // Run async as a series as getting the config might require creating it which should pause the output stream
        async.series( {
            projectPkg: async.apply( icarus.utils.getPkg, root ),
            config: icarus.utils.getConf
        }, function( err, res ) {
            if ( err ) {
                // @todo Handle an error here
                console.log( 'deploy route error with async setup ' + err );

                process.exit(0);
            }

            // Set variables based on async responses
            pkg = res.projectPkg;
            icarus.config.extend( res.config );

            // Hit up the options router to handle the deploy
            optsRouter();
        } );
    };

    // The router for the deploy command
    // Checks options and proceeds appropriately
    var optsRouter = function() {
        icarus.log.debug( 'Opening socket to '.info + socketPath.verbose );

        // Github deploy route
        if ( opts.git ) {
            // Check the package for a valid repository field
            validateRepoInfo( deployFromGit, onInvalidRepo );

            return;
        }

        // Create the tarball and send it to the server
        icarus.out( 'Attempting to deploy from '.info + path.resolve( root ).em );
        createTar()
            .then( sendToRemote );
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

        // Close socket
        process.exit(0);
    };

    // Get Auth stub for getting authentication token for github
    var getAuth = function() {
        var done = null,
            token = '';

        // Pass the token to the chained function
        function complete( newToken ) {
            done( newToken || token );
        }

        // If token already exists then just return that
        if ( icarus.config.get( 'auth.github.token' ) ) {
            icarus.log.debug( 'Grabbing auth token for github from the config file'.info );
            token = icarus.config.get( 'auth.github.token' );
            _.defer( complete );
        } else {
            // Otherwise we need to try and create an auth token
            getGithubAuth()
                .then( complete );
        }

        // Return the chaining function
        return {
            then: function( cb ) {
                done = cb;
            }
        }
    };

    // Makes a request to create a new github token
    var getGithubAuth = function() {
        var done = null,
            token = '';

        // Create repository fields
        var repo = pkg.repository.url.match( /[^\/]+$/ )[0],
            user = pkg.repository.url.replace( /[^\/]+$/, '' ).replace( /\/$/, '' ).match( /[^\/]+$/ )[0],      // @todo ugly, fix.
            auth_user = icarus.config.get( 'username' ) || icarus.config.get( 'auth.github.username' ) || user,
            url = '';

        // Pass the token to the chained function
        function complete() {
            icarus.log.debug( 'Authentication successful'.info );
            done.call( null, token );
        };

        // Create the authentication object
        function createAuthRequest( res ) {
            return {
                url: url,
                headers: {
                    'User-Agent': pkg.name
                },
                auth: {
                    user: res.username,
                    pass: res.password
                },
                body: JSON.stringify( {
                    client_id: res.key,
                    client_secret: res.secret,
                    scopes: 'repo',
                    note: 'icarus'
                } )
            }
        };

        // Fired after authenticing
        function onAuth( err, res, body ) {
            // Check returned status
            switch ( res.statusCode ) {
                // 200 OK - Returns a pre-existing token
                // 201 Created new token
                case 200:
                case 201:
                    token = JSON.parse( body ).token;
                    icarus.config.setFile( {
                        auth: {
                            github: {
                                username: auth_user,
                                token: token
                            }
                        }
                    }, complete );
                    break;

                // 422 Unprocessable Entity
                case 422:
                    icarus.log.error( 'Can not process authentication object'.error );
                    _.each( JSON.parse( body ).errors, function( error ) {
                        icarus.log.debug( error.message.error );
                    });
                    icarus.log.debug( 'Github Error Response Body: '.info + JSON.parse( body ).message.error );
                    process.exit(0);
                    break;

                case 401:
                    icarus.log.error( 'Invalid auth credentials'.error );
                    icarus.log.debug( 'Github Error Response Body: '.info + JSON.parse( body ).message.error );
                    process.exit(0);
                    break;

                default:
                    icarus.log.error( 'Unhandled error requesting authentication with Github'.error );
                    if ( typeof body === 'string' ) {
                        console.log( res.statusCode );
                        console.log( res.headers );
                        console.log( body );
                        icarus.log.debug( 'Github Response Body: '.info + JSON.parse( body ).message.error );
                    }
                    process.exit( 0 );
                    break;
            }
        };

        // Get-or-create a new access token (using key and secret)
        function getClientAuth( res ) {
            url = 'https://' + path.join( 'api.github.com', 'authorizations', 'clients', res.key );
            icarus.log.debug( 'Attempting to authenticate with github '.info + 'using oAuth'.em );
            request.put( createAuthRequest( res ), onAuth );
        };

        // Create new basic auth access token (password-only)
        function getAuth( res ) {
            url = 'https://' + path.join( 'api.github.com', 'authorizations' );
            icarus.log.debug( 'Attempting to authenticate with github '.info + 'using basic auth'.em );
            request.post( createAuthRequest( res ), onAuth );
        }

        // Fired on an error from prompting for auth data
        function onPromptError( err ) {
            icarus.log.error( 'Error prompting for authentication info: '.error + err );
            process.exit(0);
        };

        // Validate the info from prompt
        function onPromptSuccess( res ) {
            // Add username to the rest of the auth info
            _.extend( res, {
                username: auth_user
            });

            // Check if a key and secret was supplied and use basic auth if not
            if ( res.key === '' && res.secret === '' ) {
                getAuth( res );
            } else {
                getClientAuth( res );
            }
        };

        // Create authentication schema - by the time we use this we should already have a username to use
        var schema = {
            properties: {
              password: {
                hidden: true,
                required: true
              },
              key: {
                pattern: /^[0-9a-z]+$/,
                message: 'Client key should be only numbers',
                required: false
              },
              secret: {
                pattern: /^[0-9a-z]+$/,
                message: 'Client secret should be only numbers',
                required: false
              }
            }
        };

        // Prompt for info
        // Confirm username first of all
        // Then get the rest of the info required for authentication
        icarus.confirm( 'Authenticate with username: '.info + auth_user.em, function() {
            // Get the rest of the info
            icarus.prompt( schema, onPromptSuccess, onPromptError );
        }, function() {
            icarus.prompt( {
                properties: {
                    username: {
                        pattern: /^[0-9a-zA-Z\s\-]+$/,
                        message: 'Name should be only letters, numbers, spaces, or dashes',
                        required: true
                    }
                }
            }, function( res ) {
                // Store username
                auth_user = res.username;

                // Get the rest of the info
                icarus.prompt( schema, onPromptSuccess, onPromptError );
            }, onPromptError )
        }, function( err ) {
            icarus.log.error( 'Unhandled error confirming username to use to authenticate: '.error + err );
        } );

        // Return the chaining function
        return {
            then: function( cb ) {
                done = cb;
            }
        }
    };

    // The main function to kickstart deploying from a github branch
    // @todo refactor and tidy
    var deployFromGit = function() {
        var bar = null,
            size = 0,
            query = null;

        icarus.out( [
            'Attempting to deploy from '.info,
            pkg.repository.url.em,
            ':'.info,
            pkg.repository.branch.em
        ].join(''), 'deploying' );

        // Create repository fields
        var repo = pkg.repository.url.match( /[^\/]+$/ )[0],
            user = pkg.repository.url.replace( /[^\/]+$/, '' ).replace( /\/$/, '' ).match( /[^\/]+$/ )[0],      // @todo ugly, fix.
            url = 'https://' + path.join( 'api.github.com', 'repos', user, repo, 'tarball', pkg.repository.branch );

        // Create archive name
        var timestamp = new Date(),
            archiveName = pkg.name + '-v' + pkg.version + '-' + timestamp.toJSON() + '.tar.gz';

        // Build query string
        query = {
            pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified',
            tmpName: archiveName || 'not specified',
            build: true
        };

        // Get auth token for github and then stream the repo into tmp
        getAuth()
            .then( function( token ) {
            // Get Repository Request
            // ---
            function onGetRepo( err, res, body ) {
                if ( err ) {
                    icarus.log.error( 'Error connecting to github'.error );
                    icarus.error.handleConnectionError( err );
                    icarus.out( 'Check for unicorns'.error.bold, 'error'.error );
                    process.exit(0);
                }

                // Should also check for status's that denote a problem
                switch ( res.statusCode ) {
                    case 200:
                        // no-op, its already piping
                        break;

                    case 404:
                        icarus.log.error( 'Repository name not found at github'.error );
                        icarus.log.debug( 'Github Error Response Body: '.info + JSON.parse( body ).message.error );
                        process.exit(0);
                        break;

                    case 401:
                        icarus.log.error( 'Invalid auth credentials'.error );
                        icarus.log.debug( 'Github Error Response Body: '.info + JSON.parse( body ).message.error );
                        process.exit(0);
                        break;

                    default:
                        if ( typeof body === 'string' ) {
                            icarus.log.debug( 'Github Response Body: '.info + JSON.parse( body ).message.error );
                        }
                        break;
                }
            };

            var getRepoRequest = {
                url: url,
                headers: {
                    'User-Agent': pkg.name
                },
                qs: {
                    access_token: token
                }
            };

            // Post Repository
            // --
            function onPostRepo( err, res, body ) {
                if ( err ) {
                    icarus.log.error( 'There was an error streaming the deploy'.error );
                    icarus.error.handleConnectionError( err );
                    process.exit( 0 );
                }

                // Send feedback on the deploy
                var resp = JSON.parse( body );
                icarus.out( 'Time taken to deploy - '.info + resp.deployTime.em, 'stats' );
                icarus.out( 'Time taken to build  - '.info + resp.buildTime.em, 'stats' );
                icarus.out( resp.status.em, 'deploy status' );

                // Manually close as the socket connection will keep the program running
                process.exit( 0 );
            };

            var postRepoRequest = {
                url: route.protocol + route.host + ':' + route.port + '/' + route.path,
                headers: {
                    'User-Agent': pkg.name
                },
                qs: query
            };

            // Send a request for the branch tarball
            request.get( getRepoRequest, onGetRepo )
                .on( 'request', function( req ) {
                    // Request gets fired twice due to redirect, use number of sockets to check for the number of redirections
                    if ( _.keys( req.agent.sockets ).length <= 1 ) {
                        icarus.out( 'Connecting to github'.verbose, 'deploying' );
                    }
                })
                .on( 'response', function( res ) {
                    icarus.log.debug( 'Response code from getting the tarball: '.info + res.statusCode.toString().em )
                    icarus.out( 'Deploying repository'.verbose, 'deploying' );
                    size = parseInt( res.headers[ 'content-length' ], 10 );
                    // @todo using try-catch because progressbar sometimes goes screwy, should probably solve the actual problem
                    try {
                        bar = new Progress( 'uploading [:bar] :percent', {
                            complete    : '=',
                            incomplete  : '-',
                            width       : 30,
                            total       : size
                        });
                    } catch ( e ) {
                        icarus.log.warn( 'Error initialising progress bar: '.warn + e );
                    }
                })
                .on( 'data', function( chunk ) {
                    // Update the progress bar
                    // @todo using try-catch because progressbar sometimes goes screwy, should probably solve the actual problem
                    try {
                        if ( bar ) {
                            bar.tick( chunk.length > size ? size : chunk.length );
                        }
                    } catch ( e ) {
                        icarus.log.debug( 'Error progressing progress bar: '.warn + e );
                    }
                })
                .on( 'end', function( res ) {
                    icarus.out( 'Finished deploying repository'.verbose, 'deploying' );
                })
            .pipe( request.post( postRepoRequest, onPostRepo ) );

        });
    };



    //
    // Local Deploy Methods
    // --------------------



    // This function serves two purposes -
    // it reads the directory and stores its size and,
    // it creates an archive of the directory.
    var createTar = function() {
        var timestamp = new Date(),
            archiveName = '',
            archive = '',
            done;

        // Pass the archive name to the chained function
        function complete() {
            done( archive );
        }

        // Check for a built folder
        if ( root.match( buildID ) ) {
            icarus.log.debug( 'Deploying built artefact'.info );
            builtFolder = true;
        }

        // Create archive name
        archiveName = pkg.name + '-v' + pkg.version + '-' + timestamp.toJSON() + '.tar.gz';
        icarus.log.debug( 'Archiving as '.info + archiveName.em );
        archive = path.join( tmpFolder, archiveName );

        icarus.out( 'Creating tarball'.verbose, 'deploying' );

        // Reads the directory and stores the number of files.
        // Gzip the archive.
        // The number of files are used as a reference to measure the progress of the deployment.
        var fileReader = fstream.Reader( { path: root, type: 'Directory' } )
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
                complete();
            });

        // Set up a return so this function can be chained
        return {
            then: function( cb ) {
                done = cb;
            }
        };
    };

    // Tar up the folder
    var sendToRemote = function( tmpPath ) {
        var bar = null,
            size = 0,
            query = null;

        // Build query object
        query = {
            pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified',
            tmpName: tmpPath || 'not specified'
        };

        // Tell the server this needs building
        if ( !builtFolder ) {
            icarus.log.debug( 'Sending '.info + 'build '.verbose + 'query to trigger build tasks'.info );
            _.extend( query, {
                build: true
            } );
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
            // Should this be piped into a stream to convert to base64 before posting?
            .pipe( request.post( {
                        url: route.protocol + route.host + ':' + route.port + '/' + route.path,
                        qs: query                               // @todo as its a post should this be in the body rather than a query?
                    }, function( err, res, body ) {
                        if ( err ) {
                            icarus.log.error( 'There was an error streaming the deploy : '.error + err );
                            icarus.error.handleConnectionError( err );
                            process.exit( 0 );
                        }

                        // Send feedback on the deploy
                        var resp = JSON.parse( body );
                        icarus.out( 'Time taken to deploy - '.info + resp.deployTime.em, 'stats' );
                        icarus.out( 'Time taken to build  - '.info + resp.buildTime.em, 'stats' );
                        icarus.out( resp.status.em, 'deploy status' );

                        // Manually close as the socket connection will keep the program running
                        process.exit( 0 );
                    }) )
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
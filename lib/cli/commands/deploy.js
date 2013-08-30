/*
 * deploy
 * The deploy command tars up a directory and sends it to the server
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( './../../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    request = require( 'superagent' ),
    targz = require( 'tar.gz' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' ),
    BufferStream = require( 'bufferstream' );

// Set the path data
var route = {
    host: 'http://localhost',
    port: '8080',
    path: 'deploy'
}


// Handle an error route
var onInvalidFolder = function( dir ) {
    icarus.log.info( 'An error occurred finding the project root' );
    icarus.log.error( process.cwd() + ' is not a valid folder' );
};

// Tar up the folder
var createTarFromFolderGZ = function( dir ) {
    var compress = new targz().compress( dir, path.join( dir, 'test.tar.gz' ), function( err ) {
        if ( err ) {
            icarus.log.error( 'Error compressing folder' );
        }

        icarus.out( 'Folder compressed'.em );
    })
};

var createTarFromFolder = function( dir ) {
    var buf = new BufferStream( {
        encoding: 'binary',
        size: 'flexible'
    });

    fstream.Reader( { path: dir, type: 'Directory' } )      // read ze directory
            .on( 'entry', function( e ) {
//                console.log( 'data entry');
    //            console.log( e );
            })
            .on( 'end', function( e ) {
                console.log( 'finished reading directory' );
            })
        .pipe( tar.Pack() )                                 // tar I up
            .on( 'data', function( e ) {
//                console.log( 'tarring away' );
            })
            .on( 'end', function( e ) {
                console.log( 'tarred I up' );
            })
        .pipe( zlib.createGzip() )                          // zip I up
            .on( 'data', function( e ) {
//                console.log( 'zipping away' );
            })
            .on( 'end', function( e ) {
                console.log( 'zipped I up' );
            })
//        .pipe( fstream.Writer( 'output.tar.gz' ) )    // put I zumplace nice
//            .on( 'close', function( e ) {
//                console.log( 'Tar written to file' );
//                console.log( e );
//            });
        .pipe( buf )
            .on( 'end', function( e ) {
                console.log( 'buffered' );
                console.log( buf.getBuffer() );

                // Send it to the server in here for clarity for now
                icarus.out( 'Sending data to the server via a post' );
                request
                    .post( route.host + ':' + route.port + '/' + route.path )
                    .send( { data: buf.getBuffer()} )
                    .end( function( err, res ) {
                        if ( err ) {
                            console.log( 'error from the server' );
                            return;
                        }
                        console.log( 'response received from the server' );
                        console.log( res.body.status );
                    });

                // This still waits for the whole buffer to be filled before sending it
                // Can't it be streamed in there, maybe not using superagent.
            });

    // This is synchronous, is there any way to listen for data and end events?
    // There you go, now there are events to hook into for some async
    // This next bit is output way before the tar is created and written to disk
//    icarus.out( 'Finished packing' );
};


// Expose the deployment route
module.exports = function( opts ) {
    // Find the project root and deploy that folder
    icarus.out( 'Attempting to deploy from '.info + process.cwd().em );
    icarus.utils.findProjectRoot( onInvalidFolder, function( dir ) {
        icarus.out( 'Valid project directory - '.info + 'package.json '.em + 'found'.info );

        // Tar the folder
        createTarFromFolder( dir );

        // Send out a post with some data
//        icarus.out( 'Sending data to the server via a post' );
//        request
//            .post( route.host + ':' + route.port + '/' + route.path )
//            .send( { user: 'user', pass: 'password' } )
//            .end( function( err, res ) {
//                console.log( 'response received from the server' );
//            });
    });

};
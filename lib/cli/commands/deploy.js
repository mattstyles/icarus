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
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' );

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
var createTarFromFolder = function( dir ) {
    // Create request object
    var req = request
                .post( route.host + ':' + route.port + '/' + route.path )
                .type("binary");

    // Use fstream to read the directory and pipe it into tar, gzip and then the request object
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
//        .pipe( zlib.createGzip() )                          // zip I up
//            .on( 'data', function( e ) {
////                console.log( 'zipping away' );
//            })
//            .on( 'end', function( e ) {
//                console.log( 'zipped I up' );
//            })
//        .pipe( fstream.Writer( 'output.tar.gz' ) )    // put I zumplace nice
//            .on( 'close', function( e ) {
//                console.log( 'Tar written to file' );
//                console.log( e );
//            });
        .pipe( req )
            .on( 'data', function( e ) {
                console.log( 'piping data to the req' );
            })
            .on( 'end', function( res ) {
                console.log('finished sending data to the server');
            });
};


// Expose the deployment route
module.exports = function( opts ) {
    // Find the project root and deploy that folder
    icarus.out( 'Attempting to deploy from '.info + process.cwd().em );
    icarus.utils.findProjectRoot( onInvalidFolder, function( dir ) {
        icarus.out( 'Valid project directory - '.info + 'package.json '.em + 'found'.info );

        // Tar the folder
        // Currently also pipes the file into the request object sent to the server
        createTarFromFolder( dir );
    });

};
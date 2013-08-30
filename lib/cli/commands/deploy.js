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
var createTarFromFolderGZ = function( dir ) {
    var compress = new targz().compress( dir, path.join( dir, 'test.tar.gz' ), function( err ) {
        if ( err ) {
            icarus.log.error( 'Error compressing folder' );
        }

        icarus.out( 'Folder compressed'.em );
    })
};

var createTarFromFolder = function( dir ) {
    fstream.Reader( { path: dir, type: 'Directory' } )
        .pipe( tar.Pack() )                                 // tar I up
        .pipe( zlib.createGzip() )                          // zip I up
        .pipe( fstream.Writer( 'output.tar.gz' ) );         // put I zumplace nice

    // This is synchronous, is there any way to listen for data and end events?
    icarus.out( 'Finished packing' );
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
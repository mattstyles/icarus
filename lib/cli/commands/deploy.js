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
    request = require( 'superagent' );

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

// Expose the deployment route
module.exports = function( opts ) {
    // Find the project root and deploy that folder
    icarus.out( 'Attempting to deploy from '.info + process.cwd().em );
    icarus.utils.findProjectRoot( onInvalidFolder, function( dir ) {
        icarus.log.info( 'Valid project directory - '.info + 'package.json '.em + 'found' );

        // Tar the folder

        // Send out a post with some data
        icarus.out( 'Sending data to the server via a post' );
        request
            .post( route.host + ':' + route.port + '/' + route.path )
            .send( { user: 'user', pass: 'password' } )
            .end( function( err, res ) {
                console.log( 'response received from the server' );
            });
    });

};
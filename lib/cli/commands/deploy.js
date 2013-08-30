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


// Handle an error route
var onError = function( dir ) {
    console.log( 'there was an error finding the project route' );
};

// Expose the deployment route
module.exports = function( opts ) {
    icarus.utils.findProjectRoot( function( dir ) {
        icarus.log.info( 'Error finding project root at ' + dir );
    }, function( dir ) {
        icarus.log.info( 'Found the project root at ' + dir );
    });

};
/*
 * test
 * just for testing some aspects of commander and program control flow
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

/*
module.exports = function( opts ) {
    icarus.out( 'This is an output '.info + 'message'.info.bold + ' from the '.info + 'test action'.em );
    icarus.out( 'opts: '.verbose + opts.directory || '', 'test' );

    // Test log level
//    icarus.log.info( 'This is an info message from the test command' );

    if (!opts.directory) {
        icarus.out( 'Reading current directory --', 'test' );
        opts.directory =  'lib';
    } else {
        icarus.out( icarus.utils.strFill('folder:'.info, 12) + require('path').resolve( opts.directory ).bold, null );
    }

    setTimeout( function() {
    require('fs').readdir( opts.directory, function( err, files ) {

        files.forEach( function( file ) {
            icarus.out( icarus.utils.strFill('file:'.info, 12) + file, null );
        });

        icarus.out( 'finished reading files', 'test' );

        // Test firing an event on finish
//        icarus.cmdr.emit('verbose');

        // Test log level
//        icarus.log.info( 'This is a message fired after the timeout' );

    } )}, 1000);

};
*/


//module.exports = function( opts ) {
//    icarus.out( 'Message from the test function'.info );
//    icarus.out( 'finding package...'.info );
//
//    var find = function( pwd, done ) {
//        console.log( pwd );
////    fs.exists( path.join( process.cwd(), 'package.json' ), function( file ) {
////        console.log( file );
////    });
//
////    find( process.cwd(), function( pwd ) {
////        console.log( 'Calling the callback function' );
////    });
//
////    icarus.utils.findProjectRoot( function( found ) {
////        icarus.out( found ? 'package found'.em : 'package not found'.error );
////    });
//
//    icarus.utils.findProjectRoot( function( dir ) {
//        icarus.log.info( 'Error finding project root at ' + dir );
//    }, function( dir ) {
//        icarus.log.info( 'Found the project root at ' + dir );
//    });
//
////    icarus.out( 'WHEN IS THIS CALLED' );
//
//};


module.exports = function( opts ) {
    icarus.out( 'Message from the '.info + 'test '.white + 'function'.info );

    // Some vars to make things neater
    var url = 'http://localhost',
        port = '8080',
        route = 'test';

    // Create a request to icarus
    request
        .get( url + ':' + port + '/' + route )
        .end( function( res ) {
            icarus.out( 'Response from server: '.info );
            icarus.out( 'user: '.magenta + res.body.user.em );
            icarus.out( 'pass: '.magenta + res.body.pass.em );
        });



};
/*
 * test
 * just for testing some aspects of commander and program control flow
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( './../../icarus' );


module.exports = function( opts ) {
    icarus.out( 'This is an output '.info + 'message'.info.bold + ' from the '.info + 'test action'.em );

//    icarus.out( 'cmd: '.verbose + cmd );
    icarus.out( 'opts: '.verbose + opts.directory || '', 'test' );

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
        icarus.cmdr.emit('verbose');
    } )}, 1000);

};
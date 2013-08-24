/*
 * log
 * Displays the logs from the logfile
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( './../../icarus' ),
    exec = require( 'child_process' ).exec;

// Export the log function
module.exports = function( opts ) {
    icarus.out( 'Displaying '.info + 'logs'.em );
    icarus.out( 'for '.info + 'testlog.log'.em );

    // Set the number of lines to display
    var lines = opts.lines || 10;

    // Just use exec for now to defer to shell

    // If option all is set display the whole of the log file
    if ( opts.all ) {
        exec( 'cat testlog.log', function( err, stdout, stderr ) {
            icarus.out( stdout, null );
            return;
        } );
    } else {
        // Otherwise display the last n lines
        exec( 'tail -' + lines + ' testlog.log', function( err, stdout, stderr ) {
            icarus.out( stdout, null );
        } );
    }


};
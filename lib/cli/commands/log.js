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
    // Clear the log file, but prompt for confirmation
    if ( opts.clear ) {
        icarus.confirm( 'Confirm', function(){
            icarus.out( 'Cleaning the logs'.em );

            //
            // @todo clean/delete the logs
            //

        }, function() {
            icarus.out( 'Logs unchanged'.em );
        });
        return;
    }

    //
    // @todo check that the log we want to display actually exists
    //

    // If we got here then prepare to display the logs
    icarus.out( 'Displaying '.info + 'logs'.em );
    icarus.out( 'for '.info + 'testlog.log'.em );

    // Set the number of lines to display
    var lines = opts.lines || 10;

    // Just use exec for now to defer to shell for outputting the log file
    // If option all is set display the whole of the log file
    if ( opts.all ) {
        exec( 'cat testlog.log', function( err, stdout, stderr ) {
            if ( err ) {
                icarus.log.error( 'Error displaying testlog.log - ' + err );
            }

            icarus.out( stdout, null );
            return;
        } );
    } else {
        // Otherwise display the last n lines
        exec( 'tail -' + lines + ' testlog.log', function( err, stdout, stderr ) {
            if ( err ) {
                icarus.log.error( 'Error displaying the last ' + lines + ' lines of testlog.log - ' + err );
            }
            icarus.out( stdout, null );
        } );
    }
};
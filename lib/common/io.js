/*
 * io
 * Handles the main output stream
 * and the input prompt
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( '../icarus' ),
    util = require( 'util' ),
    colors = require( 'colors' ),
    input = require( 'prompt' );



/*
 * output - just wraps util.puts for now
 */
var out = exports.out = (function() {
    // Initialise the output stream here

    // Return a function to print to the output stream
    return function( output, id ) {
        var level = typeof id === 'string' ? id + ': ' : 'icarus: ';

        util.puts( icarus.utils.strFill( level, 10 ).grey + output );
    };
})();



/*
 * input - handles the prompt
 */
var prompt = exports.prompt = (function() {
    // Initialise the input prompt

    // Expose a function to use the input stream
    return function( prop, success, failure ) {
        // Start the prompt
        input.start();

        // Now use the prompt
        input.get( prop, function( err, res ) {
            // Handle an error
            if ( err ) {
                // Send the error to the logs
                icarus.log.error( 'Error receiving input from prompt: ' + err );

                // Call the failure callback, passing the error, and then return
                if ( typeof failure === 'function' ) {
                    failure( err );
                }
                return;
            }

            // If we got here then the prompt succeeded so call the callback with the result
            success( res );
        });
    }
})();

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
 * ### function( output, id )
 * #### @output {string | array} The string to output, array gets formatted
 * #### @id {string} - optional - The sub-string to output, defaults to 'icarus:'
 * Wraps puts to output to stdout - adds a string spacer so that the main output
 * is correctly aligned.  Only outputs strings.
 */
var out = exports.out = (function() {
    // Initialise the output stream here
    var format = icarus.config.get( 'format' );

    // Return a function to print to the output stream
    return function( output, id ) {
        var level = '';

        // Join an array and add the id if applicable
        if ( util.isArray( output ) ) {
            if ( id!== null) {
                level = typeof id === 'string' ? '\n' + id + ': '.grey : '\n' + format.def + ': '.grey;
            }

            // Join the array together and add the id
            output = icarus.utils.joinBefore( output, level !== '' ? icarus.utils.strFill( level, format.margin + 1 ) : '\n');

            // Strip the preceeding line break
            output = output.replace( /^\n/, '' );

            // Output the formatted array and return
            util.puts( output );
            return;
        }

        // Handle a string, check for an
        // id to use and then send it to the output stream
        if ( typeof output === 'string' ) {
            if ( id !== null ) {
                level = typeof id === 'string' ? id + ': ' : format.def + ': ';
            }

            util.puts( (level !== '' ? icarus.utils.strFill( level, format.margin ).grey : '') + output );
            return;
        }

        // If we dropped through to here then the output parameter is not a string
        // or an array so fail noisily
        icarus.log.error( 'Output requires a string or an array' );
        process.exit(0);
    };
})();



/*
 * ### function( prop, success, failure )
 * #### @prop {string | array | object} String or Array of parameters to prompt to be
 *      filled, returns as an object inside res
 * #### @success {function} Called on succes, passing the result
 * #### @failure {function} - optional - Called on error, passing the error
 * Wraps prompt and adds functionality for success or failure callbacks.
 * Sends the error to the logs on error.
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
                icarus.log.error( '\nError receiving input from prompt: ' + err );

                // Call the failure callback, passing the error, and then return
                if ( typeof failure === 'function' ) {
                    failure( err );
                }
                return;
            }

            // If we got here then the prompt succeeded so call the callback with the result
            if ( typeof success === 'function' ) {
                success( res );
            }
        });
    };
})();



/*
 * ### function( prop, success, failure, error )
 * #### @prop {string | array} String or Array of parameters to prompt to be
 *      filled, returns as an object inside res
 * #### @success {function} Called on affirmative response
 * #### @failure {function} Called on negative response
 * #### @error {function} Called on error
 * Prompts for 'y' or 'yes' confirmation, otherwise fires the failure function.
 * Sends an error to the log and calls the error function if specified
 */
var confirm = exports.confirm = (function() {
    // Initialise the confirm prompt here

    // Expose a function to use the confirm input stream
    return function( prop, success, failure, error ) {
        // Manipulate the prop to add confirm
        prop = prop + '(y/n)'.grey;

        //Start the prompt
        input.start();

        // Now use the prompt
        input.get( prop, function( err, res ) {
            // Handle any error
            if ( err ) {
                // Send an error to the logs
                icarus.log.error( '\nError receiving input from the confirmation prompt: ' + err );

                // Call the error function, passing the error and return
                if ( typeof error === 'function' ) {
                    error( err );
                }
                return;
            }

            // If we got here then work out the confirmation
            if ( res[prop].toLowerCase() === 'y' || res[prop].toLowerCase() === 'yes' ) {
                if ( typeof success === 'function' ) {
                    success();
                }
            } else {
                if( typeof failure === 'function' ) {
                    failure();
                }
            }
        });
    };
})();

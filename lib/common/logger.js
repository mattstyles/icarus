/*
 * logger
 * provides an interface to log with
 * log can be to console or to a file
 * can also be used as a general interface to the stdout
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

var util = require( 'util' );

// The log object
// Returns a contructor function that can be used to create new objects
module.exports = function() {

    // Defaults to console output
    // Other values are debug
    var type = 'out';

    // Specify the file to print to
    var filename = '';

    return {
        // Print out a line - defaults to console output
        print: function( log ) {
            // If this is a logging logger and a filename for logging has been specified
            if ( type === 'log' && filename !== '' ) {
                // Log to the file using a timestamp

                // Currently does nothing
            }

            // Log to stdout
            switch (typeof log) {
                case 'string':
                    util.puts( log );
                    break;

                case 'array':
                    util.puts( log.join() );
                    break;

                case 'object':
                    util.inspect( log );
                    break;

                default:
                    util.puts( log );
            }
        }
    }

};

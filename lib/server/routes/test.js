/*
 * test route
 * just a route for testing stuff out
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var fs = require( 'fs' ),
    path = require( 'path' );


// Export the test route
module.exports = function( req, res ) {
    // Write to a file and return a response
    fs.readFile( path.join( process.env.HOME, '.icarus/test', 'testlog.log' ), { encoding: 'utf8' }, function( error, result ) {
        if ( error ) {
            // Do something to handle the error properly, for now just log it
            console.log( 'Error grabbing the testlog.log' );
        }

        // Send the contents of the file back
        console.log( 'Read the file' );
        res.send( JSON.parse( result ) );
    } );
}
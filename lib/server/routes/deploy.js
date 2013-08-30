/*
 * deploy route
 * post route - accepts a tarball, unpacks it and puts it in the right place
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

//    console.log( req );
    console.log( 'received deploy as a binary' );
    res.send( { "status": "deployed" } );
}
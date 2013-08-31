/*
 * deploy route
 * post route - accepts a tarball, unpacks it and puts it in the right place
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( '../../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' );


// Export the test route
module.exports = function( req, res ) {

//    console.log( req );
//    console.log( 'received deploy as a binary' );
//    icarus.log.info( 'Deployment tar received' );

    // Get some info about the transfer
    var reqData = {
//        bytes: req.bytesRead,
        start: new Date().getMilliseconds()
    }

    req
    .pipe( tar.Extract( {
        path: process.env.HOME + '/.icarus/www'
    }))
        .on( 'error', function( err ) {
            console.log( 'Ut oh' + err );
            res.send( {"status": "something went horribly, horribly wrong"} );
            return;
        })
        .on( 'end', function () {
//            console.log( 'Successfully extracted tar' );

            // Do a basic speed check
            var endTime = new Date().getMilliseconds();
            if ( endTime < reqData.start ) {
                endTime = endTime + 1000;
            }
            console.log( 'Time taken: '.grey + ( endTime - reqData.start ).toString().yellow.bold );
    //        console.log( req );
            res.send( { "status": "deployed" } );
        });
};
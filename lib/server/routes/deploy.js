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
    path = require( 'path' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' );


// Export the test route
module.exports = function( req, res ) {

//    console.log( req );
    console.log( 'received deploy as a binary' );

    var file = req.body.data;

//    fstream.Reader( file )

//    fs.createReadStream( file );
//        .pipe( tar.Extract( {
//            path: '/.icarus/www/hellonode'
//        }))
//        .on( 'error', function( err ) {
//            console.log( 'Ut oh' );
//            res.send( {"status": "something went horribly, horribly wrong"} );
//            return;
//        })
//        .on( 'end', function () {
//            console.log( 'Successful extracted tar' );
//            res.send( { "status": "deployed" } );
//        });
//    fs.createReadStream( req )
//        .on( 'error', function( err ) {
//            console.log( 'ut oh, error ' + err );
//        })
//        .on( 'data', function( e ) {
//            console.log( 'data streaming in to the request');
//        })
//        .on( 'end', function( e ) {
//            console.log( 'finished streamin' );
//        });

    // This works, so long as the response is not sent then the connection will remain open and
    // more data will be received
//    req.on( 'data', function( e ) {
//        console.log( 'req receiving data ');
//    });
//    req.on( 'end', function() {
//        console.log( 'finished with the receiving of the data' );
//        res.send( { "status": "deployed" } );
//    });

    req.pipe( tar.Extract( {
        path: process.env.HOME + '/.icarus/www'
    }))
    .on( 'error', function( err ) {
        console.log( 'Ut oh' + err );
        res.send( {"status": "something went horribly, horribly wrong"} );
        return;
    })
    .on( 'end', function () {
        console.log( 'Successfully extracted tar' );
        res.send( { "status": "deployed" } );
    });


//    console.log( req );

}
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
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' );

// Export the test route
module.exports = function( req, res ) {

    // Get some info about the transfer
    var reqData = {
//        bytes: req.bytesRead,
        start: new Date().getMilliseconds()
    }

    // Pipe the request into the tar extractor
    req
        .pipe( tar.Extract( {
            path: process.env.HOME + '/.icarus/www'
        }))
            .on( 'error', function( err ) {
                icarus.log.info( 'Deployment'.grey + ' unsuccessful'.red.bold );
                icarus.log.debug( 'The following error occurred while trying to deploy ' + req.query.pkgName );
                icarus.log.debug( err );
                res.send( {"status": "something went horribly, horribly wrong"} );
                return;
            })
            .on( 'end', function () {
                // Do a basic speed check
                var endTime = new Date().getMilliseconds();
                if ( endTime < reqData.start ) {
                    endTime = endTime + 1000;
                }
                icarus.log.info( 'Time taken to deploy: '.grey + ( endTime - reqData.start ).toString().yellow.bold );
                icarus.log.info( 'Deployment'.grey + (req.query.pkgName ? ' of '.grey + req.query.pkgName.toString().yellow.bold  : '') + ' ...'.grey + 'successful'.green.bold  );

                res.send( { "status": "deployed" } );
            });
};
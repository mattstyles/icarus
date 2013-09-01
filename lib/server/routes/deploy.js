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
    util = require( 'util' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' );

// Export the test route
module.exports = function( req, res ) {
    var deployPath = path.join( icarus.utils.getHome(), icarus.config.get( 'dir.main' ), icarus.config.get( 'dir.deploy' ) );

    icarus.log.info( 'Attempting to deploy '.grey + req.query.pkgName.yellow.bold + ' tarball into '.grey + deployPath.yellow.bold );

    // Get some info about the transfer
    var reqData = {
//        bytes: req.bytesRead,
        start: new Date()
    }

    // Pipe the request into the tar extractor
    req
//        .pipe( zlib.Unzip() )
        .pipe( tar.Extract( {
            path: deployPath
        }))
            .on( 'data', function ( e ) {
                util.print( '.'.grey );
            })
            .on( 'error', function( err ) {
                icarus.log.info( '\nDeployment'.grey + ' unsuccessful'.red.bold );
                icarus.log.debug( 'The following error occurred while trying to deploy ' + req.query.pkgName );
                icarus.log.debug( err );
                res.send( { "status": "something went horribly, horribly wrong" } );
                return;
            })
            .on( 'end', function () {
                // Do a basic speed check
                var endTime = new Date();
//                if ( endTime < reqData.start ) {
//                    endTime = endTime + 1000;
//                }
                icarus.log.info( '\nTime taken to deploy: '.grey + ( icarus.utils.timeFormat( endTime - reqData.start ) ).toString().yellow.bold );
                icarus.log.info( 'Deployment'.grey + (req.query.pkgName ? ' of '.grey + req.query.pkgName.toString().yellow.bold  : '') + ' ...'.grey + 'successful'.green.bold  );

                res.send( { "status": "deployed" } );
            });
};
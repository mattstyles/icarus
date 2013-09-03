/*
 * deploy
 * The deploy command tars up a directory and sends it to the server
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( './../../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' ),
    request = require( 'superagent' ),
    tar = require( 'tar' ),
    fstream = require( 'fstream' ),
    zlib = require( 'zlib' );

// Set the path data
var route = {
    host: 'http://localhost',
    port: '8080',
    path: 'deploy'
}


// Handle an error route
var onInvalidFolder = function( dir ) {
    icarus.log.info( 'An error occurred finding the project root' );
    icarus.log.error( process.cwd() + ' is not a valid folder' );
};

// Tar up the folder
var createTarFromFolder = function( dir, pkg ) {
    // Create request object
    var req = request
                .post( route.host + ':' + route.port + '/' + route.path )
                .type("binary")
                .query( { pkgName: icarus.utils.parsePkgName( pkg.name ) || 'not specified' } )
                .on( 'response', function( res ) {
                    icarus.out( '\nstatus: '.info + res.body.status.em );
                })
                .on( 'error', function( err ) {
                    icarus.log.error( 'there was an error streaming the deploy' );
                });



    // Use fstream to read the directory and pipe it into tar, gzip and then the request object
    fstream.Reader( { path: dir, type: 'Directory' } )      // read ze directory
            .on( 'entry', function( e ) {
//                console.log( 'data entry');
    //            console.log( e );
            })
            .on( 'end', function( e ) {
                icarus.out( 'finished reading directory'.verbose );
            })
        .pipe( tar.Pack() )                                 // tar I up
            .on( 'data', function( e ) {
                util.print( '.'.info );
            })
            .on( 'end', function( e ) {
                icarus.out( 'tarred I up'.verbose );
            })
//        .pipe( zlib.createGzip() )                    // zip I up
//        .pipe( fstream.Writer( 'output.tar.gz' ) )    // put I zumplace nice
//            .on( 'close', function( e ) {
//                console.log( 'Tar written to file' );
//                console.log( e );
//            });
        .pipe( req )                                    // pipe I doon ze wire
            .on( 'data', function( e ) {
                icarus.out( 'piping data to the req' );     // never called
            })
            .on ( 'error', function( err ) {
                icarus.log.error( 'Error piping to the request' );
            })
            .on( 'end', function() {
                // Fired after the request object response event
//                icarus.out( 'finished sending data to the server'.green.bold );
//                icarus.out( 'Status: ' + res.body.status );
            });


};


// Expose the deployment route
module.exports = function( opts ) {
    // Find the project root and deploy that folder
    icarus.out( 'Attempting to deploy from '.info + process.cwd().em );
    icarus.utils.findProjectRoot( onInvalidFolder, function( dir ) {
        // Read the package and pass to the main create tar function
        fs.readFile( path.join( dir, 'package.json' ), function( err, res ) {
            if ( err ) {
                // Handle this error
                // For now just log an error but we should probably exit
                icarus.log.warn( 'No package.json found at root -- using default log file' );
                process.exit();
            }

            icarus.log.debug( 'Found package.json for the project'.info );
            icarus.out( 'Valid project directory - '.info + 'package.json '.em + 'found'.info );

            // Tar the current folder
            // Currently also pipes the file into the request object sent to the server
            createTarFromFolder( dir, JSON.parse( res ) );
        });

    });

};
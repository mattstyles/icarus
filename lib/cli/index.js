/*
 * icarus.cli
 * top-level include for the cli module of icarus
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( '../icarus' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    util = require( 'util' );

// CLI module
module.exports = {

    /*
     * init
     *
     * Asynchronously setup the CLI
     */
    init: function( done ) {

        // Require CLI modules
        icarus.out = require( '../common/io' ).out;
        icarus.prompt = require( '../common/io' ).prompt;

        // Setup the config object and then pass on control flow
        icarus.config.init( done );
    },

    /*
     * start
     *
     * Starts the CLI, sets up commander and routes to an action
     */
    start: function() {

        // Setup the config object and then proceed once that is done
        this.init( this.showVersion );
    },


    showVersion: function() {
        icarus.out( 'version '.info + icarus.config.get('version').em );
        icarus.prompt( ['name','pass'], function( res ) {
            console.log( 'Prompt success'.cyan + ' -- result: ' );
            console.dir( res );
        }, function( err ) {
            console.log( 'Error from prompt'.error );
        } );
//        icarus.log.info('a debug message');
    }
};

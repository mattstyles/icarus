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
    util = require( 'util' ),
    async = require( 'async' ),
    _ = require( 'underscore' );

// CLI module
module.exports = {

    /*
     * init
     *
     * Asynchronously setup the CLI
     */
    init: function( done ) {

        // Extend icarus with commander as we're running the CLI
        _.extend( icarus, require('commander'));

        // Require CLI modules
        icarus.out = require( './io' ).out;
        icarus.prompt = require( './io' ).prompt;

        // Setup the config object and then pass on control flow
        icarus.config.init( done );
    },

    /*
     * router
     *
     * Use commander to route commands and options
     */
    router: function( done ) {

        // wait for a bit and then return success
        setTimeout( function() {
            done();
        }, 1000);

    },

    /*
     * start
     *
     * Starts the CLI, sets up commander and routes to an action
     */
    start: function() {
        // Perform asynchronous setup and then perform action based on args
        async.parallel([
            this.init,
            this.router
        ], function(err, res ) {
            icarus.cli.showVersion();
        } );
    },


    showVersion: function() {
        icarus.out( 'version '.info + icarus.config.get('version').em );
//        icarus.prompt( 'name', function( res ) {
//            icarus.out( 'Prompt success'.cyan );
//            icarus.cli.getPrompt();
//        } );
//        icarus.log.info('a debug message');
    },

    getPrompt: function() {
        icarus.prompt( 'test', function( res ) {
            icarus.out( 'Again, succesful' );
            icarus.cli.getPrompt();
        } );
    }
};

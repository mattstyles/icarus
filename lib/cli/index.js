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
    io = require( './io' ),
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

        // Create a separate cmdr object to hold commands and protect the namespace a little
        icarus.cmdr = require( 'commander' );

        // Require CLI modules
        icarus.out = io.out;
        icarus.prompt = io.prompt;
        icarus.confirm = io.confirm;

        // Setup the config object, config.init will call the success callback when its ready
        icarus.config.init( done );
    },

    /*
     * router
     *
     * Use commander to route commands and options
     */
    router: function( done ) {
        // Just defer to the routing module, will call done when it is ready
        require( './router' )( done );
    },

    /*
     * start
     *
     * Starts the CLI, sets up commander and routes to an action
     */
    start: function() {
        // Perform setup series and then perform action based on args
        // Can not be run in parallel, later tasks require setup stuff from earlier tasks
        async.series([
            this.init,
            this.router
        ], function(err, res ) {
            if ( err ) {
                icarus.log.error( '\nError starting icarus ' + err );
            }

            // Do other start stuff here
            // Let commander go to work
            icarus.cmdr.parse( process.argv );

            // If no args were passed to icarus then just display the help
            if ( process.argv.length <= 2 ) {
                require( './commands/help' )();
                icarus.cmdr.outputHelp();
            }
        } );
    }

};

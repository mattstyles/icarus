/*
 * icarus.cli
 * top-level include for the cli module of icarus
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

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
        // Alias for output - just wraps util.puts for now
        icarus.out = function( output ) {
            util.puts( output );
        };

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
    }
}

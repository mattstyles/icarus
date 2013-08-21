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
    path = require( 'path' );

// CLI module
module.exports = {

    /*
     * start
     *
     * Starts the CLI, sets up commander and routes to an action
     */
    start: function() {

        // Setup the config object and then proceed once that is done
        icarus.config.init( this.showVersion );
    },


    showVersion: function() {
        console.log( 'version '.info + icarus.config.get('version').em );
    }
}

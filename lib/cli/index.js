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

        // Grab the version from the package
        var version = fs.readFileSync( path.join( __dirname, '../../package.json'), 'utf8' );
        version = JSON.parse( version ).version;
        version = version || 'specify version';

        version = icarus.utils.getVersion();

        console.log( 'version '.info + version.key );

    }
}

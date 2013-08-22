/*
 * router
 * Sets up the commander commands/options for the CLI
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


// Includes
var icarus = require( '../icarus' ),
    cmdr = require( 'commander' ),
    _ = require( 'underscore' );

// export the routing function
// must be passed in the done callback to tell async when it is finished
module.exports = function( done ) {

    // Extend commander with icarus custom shizzle
    _.extend(icarus.cmdr, router);

    // Set up routes
    icarus.cmdr
        .version( icarus.config.get( 'version' ) )
        .option( '-q, --quiet', 'quiet mode - suppress logs')
        .option( '-v, --verbose', 'display more logs')

    icarus.cmdr.on( '--version', icarus.cli.showVersion );

    icarus.cmdr.parse( process.argv );

    // Tell async we're good to go
    done();
};



/*
 * Extend the commander prototype to override some core functionality
 * This could optionally be done by maintaining a fork although as this
 * functionality is unique to icarus it makes more sense to do it here
 */
var router = {
    // Overrides the help arg
    // Currently outputs nothing of proper interest
    outputHelp: function() {
        console.log('extending commander with some extra shit');

        icarus.out( icarus.utils.joinBefore([
            'this',
            'is',
            'an',
            'output',
            'test'
        ], '\nhelp:  '.cyan), null );

        icarus.out( [
            'another',
            'test',
            'of',
            'outputting',
            'an',
            'array'
        ], 'info'.cyan);

        icarus.out( 'a string' );

        icarus.out( 'another string', 'info' );
    },

    // Override the version function
    // Version sets the version and also sets a listener for the version arg
    version: function(str, flags){
        if (0 == arguments.length) return this._version;
        this._version = str;
        flags = flags || '-V, --version';
        this.option(flags, 'output the version number');

        // Dont need this, set it in the routing function
//        this.on('version', function(){
//            console.log(str);
//            process.exit(0);
//        });

        return this;
    }
}
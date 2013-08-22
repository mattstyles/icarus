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


/*
 * Extend the commander prototype to override some core functionality
 * This could optionally be done by maintaining a fork although as this
 * functionality is unique to icarus it makes more sense to do it here
 */
var cmdrExtend = {
    // Overrides the help arg
    // Don't use yet - just use standard commander help for now
//    outputHelp: require( './help' ),

    // Override the version function
    // Version sets the version and also sets a listener for the version arg
    version: function(str, flags){
        if (0 === arguments.length) {
            return this._version;
        }
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
};


// export the routing function
// must be passed in the done callback to tell async when it is finished
module.exports = function( done ) {

    // Extend commander with icarus custom shizzle
    _.extend(icarus.cmdr, cmdrExtend);

    // Set up routes
    icarus.cmdr
        .version( icarus.config.get( 'version' ) )
        .option( '-q, --quiet', 'quiet mode - suppress logs')
        .option( '-v, --verbose', 'display more logs')
        .option( '-t, --test', 'test mode' );

    // Route option listeners - @todo be smarter - read the files and add listeners
    icarus.cmdr
        .on( 'version', require( './options/version' ) )
        .on( 'verbose', require( './options/verbose' ) )
        .on( 'quiet', require( './options/quiet') );

    // Create commands
    icarus.cmdr
        .command( '*' )
        .action( require( './commands/help') );

    // Tell async we're good to go
    done();
};

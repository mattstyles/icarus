/*
 * utils
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

var icarus = require( '../icarus' ),
    colors = require( 'colors' );


// Set up custom colors for logging
colors.setTheme( {
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'grey',
    key: ['yellow', 'bold'],
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
} );


// Set up some helpers for file management
module.exports = {

    getVersion: function( filename ) {
        return 'sha-ting';
    }

};
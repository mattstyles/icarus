/*
 * utils
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


var icarus = require( '../icarus' ),
    colors = require( 'colors' ),
    util = require( 'util' );


// Set up custom colors for output
colors.setTheme( {
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'grey',
    em: ['yellow', 'bold'],
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
} );


// The utils object
module.exports = {

    // Quick string space fill function
    strFill: function( str, len ) {
        while ( str.length < len ) {
            str += ' ';
        }

        return str;
    },

    /*
     * ### function( arr, sep )
     * #### @arr {array} the array to join together
     * #### @sep {string} the separator to use
     * #### @returns {string} the combined array as a string
     * Applies join to an array but does it so the separator looks like it has been
     * placed before each element rather than after it.
     */
    joinBefore: function( arr, sep ) {
        arr.splice( 0, 0, '' );
        return arr.join( sep );
    }

};
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

};
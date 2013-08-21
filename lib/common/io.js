/*
 * io
 * Handles the main output stream
 * and the input prompt
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */


var icarus = require( '../icarus' ),
    util = require( 'util' ),
    colors = require( 'colors' );


// output - just wraps util.puts for now
var out = exports.out = function( output ) {
    util.puts( 'icarus:   '.grey + output );
};

// input - just outputs a prompt for now, should actually handle a prompt
var prompt = exports.prompt = function( input ) {
    util.puts( '> '.grey + input );
};

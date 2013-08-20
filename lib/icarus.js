/*
 * icarus : top-level include for icarus
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

// Includes
var colors = require( 'colors' );

var icarus = module.exports = require( 'commander' );

// Expose cli and listener modules
icarus.cli = require( './cli' );
icarus.listen = require( './listen' );

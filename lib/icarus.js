/*
 * icarus : top-level include for icarus
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

// Includes
var colors = require( 'colors' );

// Create Icarus
var icarus = module.exports = require( 'commander' );


// Apply Icarus Modules
icarus.utils = require( './common/utils' );
icarus.config = require( './common/config' );
icarus.log = require( './common/logger' );


// Expose cli and listener modules
icarus.cli = require( './cli' );
icarus.listen = require( './listen' );

/*
 * .. -.-. .- .-. ..- ...
 *
 * icarus : top-level include for icarus
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 *
 * .. -.-. .- .-. ..- ...
 */
'use strict';


// Includes
var colors = require( 'colors' );

// Create icarus
var icarus = module.exports = {};


// Apply icarus modules
icarus.utils = require( './common/utils' );
icarus.config = require( './common/config' );
icarus.log = require( './common/logger' );
icarus.error = require( './common/error' );


// Expose cli and listener modules
icarus.cli = require( './cli' );
icarus.server = require( './server' );

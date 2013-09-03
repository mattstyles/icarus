/*
 * icarus.server
 * top-level include for the server module of icarus
 * server is responsible for the bulk of the work, responding to requests
 * from the cli and responding as it should
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus  = require( '../icarus' ),
    express = require( 'express' ),
    io      = require( 'socket.io');

// Expose server object
module.exports = {

    // Initialise the express server and configure routes
    init: function() {
        // Create Express Server
        icarus.server = express();

        // Configure server
        icarus.server.set( 'port', process.env.PORT || 8080 );

        // Middleware
//        icarus.server.use( express.logger() );  // Use custom logging via winston
        //icarus.use( express.compress() );     // Probs dont need this as generally not sending much back
        icarus.server.use( express.methodOverride() );
        icarus.server.use( express.bodyParser() );      // Is this interfering with streaming the deployment tar
        icarus.server.use( icarus.server.router );

    },

    // Spin up the server and start it listening on the env port
    start: function() {
        // Initialise the server
        icarus.server.init();

        // Start the Server and expose the socket instance
        icarus.server.io = io.listen ( icarus.server.listen( icarus.server.get( 'port' ), function() {
            icarus.log.info( 'Server started on port '.info + icarus.server.get( 'port' ).toString().em );
        } ) );

        // Apply Routes
        require( './router' );

        // Apply Socket Routes
        require( './sockets' );
    }
};

/*
 * logger
 * Use winston for the logs
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */

var winston = require( 'winston' );


module.exports = (function() {

    // Setup the logging object
    winston.add( winston.transports.File, { filename: 'testlog.log' } );

    // Return the logging object
    return winston;

})();
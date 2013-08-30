/*
 * main route
 * simply returns that icarus is running and ready to rock
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
module.exports = function( req, res ) {
    res.send( 'icarus is ready to rock\n' );
}
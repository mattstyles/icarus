/*
 * test socket
 * just a socket for testing stuff out
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Export functionality
module.exports = function( socket ) {

    // On a connection emit some news
    socket.emit( 'news', {
        data: 'This is some news'
    } );

    // Handle reaction to the news story
    socket.on( 'reaction', function( data ) {
        console.log( 'Received a reaction: ' + data.data + '.  I\' send more news.' );

        socket.emit( 'morenews', {
            data: 'Here is another news story'
        });
    } );


};
/*
 * help
 * contains help info for icarus cli
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';

// Includes
var icarus = require( './../../icarus' );

// Export the help function
/*
module.exports = function() {
     icarus.out( [
          ''
        , '  Usage: ' + icarus.cmdr._name + ' ' + icarus.cmdr.usage()
        , '' + icarus.cmdr.commandHelp()
        , '  Options:'
        , ''
        , '' + icarus.cmdr.optionHelp().replace(/^/gm, '    ')
        , ''
        , ''
      ], 'help'.yellow);

    // Fire an event to say the help has been displayed
    icarus.cmdr.emit( '--help' );
};
*/




/* Some playing with ASCII */
module.exports = function() {
    /*
    icarus.out( [
    '',
    ' _',
    '(_) ___ __ _ _ __ _   _ ___',
    '| |/ __/ _` | `__| | | / __|',
    '| | (_| (_| | |  | |_| \\__ \\ ',
    '|_|\\___\\__,_|_|   \\__,_|___/',
    ''], 'help'.yellow);
    */

    icarus.out( [
    '',
    ' ;.          ,-~~\\            <~)_   ,-.',
    '; |           (   \\            ( v~\\ | |',
    '`.| .-===-.,   |\\. \\   .---.    \\_/\' | \'',
    '  | `.___.\'   _]_]`\\\\ \'.___.\'   /\\   |  ',
    '',
    ], 'help'.yellow);
};

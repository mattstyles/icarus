/*
 * utils
 *
 * Copyright  ©  2013 Matt Styles
 * Licensed under the MIT license
 */
'use strict';


var icarus = require( '../icarus' ),
    colors = require( 'colors' ),
    util = require( 'util' ),
    fs = require( 'fs' ),
    path = require( 'path' );


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

    // Quick string space fill function
    strFill: function( str, len ) {
        var n = len - str.stripColors.length;

        while ( n > 0 ) {
            str = str + ' ';
            n = n - 1;
        }

        return str;
    },

    // Parse pkg name
    // Lower case it and replace spaces with dashes
    parsePkgName: function( name ) {
        // It's possible name does not exist so return null
        if ( !name ) {
            return null;
        }

        // Otherwise set to lower case and change spaces to dashes
        return name.toLowerCase().replace( /\ /, '-' );
    },

    /*
     * ### function( arr, sep )
     * #### @arr {array} the array to join together
     * #### @sep {string} the separator to use
     * #### @returns {string} the combined array as a string
     * Applies join to an array but does it so the separator looks like it has been
     * placed before each element rather than after it.
     */
    joinBefore: function( arr, sep ) {
        arr.splice( 0, 0, '' );
        return arr.join( sep );
    },


    /*
     * ### function( dir, err, cb )
     * #### @dir {string} - optional - will use current working directory if a path is not passed in
     * #### @err {function} - optional - error callback to use when file is not found, error is logged here anyway
     * #### @cb {function} callback to use when the file is found
     * Recursively searches for a package.json and assumes that the folder it is found in is the project root.
     * Stops the search at HOME or '/' - logs an error, calls error callback and returns false.
     * Excludes paths if they contain certain strings, such as /node_modules/.
     * Only the callback is required, the directory to start searching in and the error callback are both optional.
     * On 'file not found' error the param passed to callback will be false, otherwise it will be the root directory.
     */
    findProjectRoot: function( dir, err, cb ) {
        // If no params were passed in then raise the alarm
        if ( typeof dir === 'undefined' ) {
            icarus.log.error( 'Error finding project root: '.info + 'incorrect parameter list'.error );
            return;
        }

        // If only a function/s are passed in i.e. no search directory is passed in
        if ( typeof dir === 'function' ) {
            icarus.log.debug( 'No search location passed to '.info + 'findProjectRoot'.em + '.  Using current directory'.info);
            icarus.utils.findProjectRoot( process.cwd(), dir, err );
            return;
        }

        // If cb is not passed in then assume that the error parameter has been omitted and standard error handling occurs
        if ( typeof cb === 'undefined' ) {
            icarus.log.debug( 'No error callback passed to '.info + 'findProjectRoot'.em);
            icarus.utils.findProjectRoot( dir, null, err );
            return;
        }

        icarus.log.debug( 'Searching for package.json...'.info );

        // Exclude directories if their paths include the following
        // Use regex
        icarus.log.debug( 'Excluding \/node_modules\/'.info );
        var exclude = /\/node_modules|\/dist|\/prod/;

        // Check for the existence of the file at the current directory, recursively search if not found
        fs.exists( path.join( dir, 'package.json' ), function( found ) {
            // Check for 'file not found' error - called on hitting home or root
            if ( dir === process.HOME || dir === '/' ) {
                // Log the error
                icarus.log.debug( 'Error '.error + 'finding project root -- '.info + 'no file found'.error );
                icarus.log.debug( 'Current work directory: '.info + process.cwd().white );
                if ( dir === process.HOME ) {
                    icarus.log.debug( 'Hit HOME directory'.error );
                }
                if ( dir === '/' ) {
                    icarus.log.debug( 'Hit ROOT directory'.error );
                }

                // Call the error callback if it exists as a function
                if ( typeof err === 'function' ) {
                    err( dir );
                } else {
                    // Otherwise call the callback function with null, we have already checked that it is a function
                    cb( null );
                }
                return;
            }

            // If the file was found and the current search path does not contain an excluded search term
            if ( found && !(dir.match( exclude )) ) {
                icarus.log.debug( 'Package.json for this project found'.info );
//                icarus.out( 'Project Root: '.info + path.resolve( dir ).white );

                // Call the callback so long as it is a function
                if ( typeof cb === 'function' ) {
                    cb( path.resolve( dir ) );
                }
                return;
            }

            // Otherwise recurse into parent directory
            icarus.log.debug( 'File not found at '.info + dir.em);
            icarus.utils.findProjectRoot( path.join( dir, '..' ), err, cb );
        });
    },

    // Returns cross-platform home directory
    getHome: function() {
        return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    },

    // Returns the whole and the remainder of a division
    divide: function( num, div ) {
        return {
            whole: Math.floor( num / div ),
            rem: num % div
        }
    },

    // Returns a string representation of a time period
    // time represents the period in milliseconds
    timeFormat: function( time ) {
        var str = '',
            sum = {};

        // Get hours
        if ( time > 1000 * 60 * 60 ) {
            sum = icarus.utils.divide( time, 1000 * 60 * 60 );
            str = str + sum.whole + 'h ';
            time = sum.rem;
        }

        // Get minutes
        if ( time > 1000 * 60 ) {
            sum = icarus.utils.divide( time, 1000 * 60 );
            str = str + sum.whole + 'm ';
            time = sum.rem;
        }

        // Get seconds
        if ( time > 1000 ) {
            sum = icarus.utils.divide( time, 1000 );
            str = str + sum.whole + 's ';
            time = sum.rem;
        }

        // Finally add the remaining milliseconds and return
        return str + time + 'ms';
    }

};
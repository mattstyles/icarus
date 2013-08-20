/*
 * icarus
 * https://github.com/mattstyles/icarus
 *
 * Copyright (c) 2013 Matt Styles
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function( grunt ) {

    // ------------------------------------------------------
    // --
    // --   Meta
    // --
    // ------------------------------------------------------

    // load all grunt tasks
    require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );


    // ------------------------------------------------------
    // --
    // --   Task Config
    // --
    // ------------------------------------------------------

    grunt.initConfig({
        clean: {
            jshint: '.jshint'
        },

        jsonmin: {
            jshint: {
                options: {
                    stripWhitespace : true,
                    stripComments   : true
                },
                files: {
                    '.jshint' : '.jshintrc'
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshint'
            },
            all: [
                'Gruntfile.js',
                'lib/{,*/}*.js'
            ]
        }

    });

    // ------------------------------------------------------
    // --
    // --   Tasks
    // --
    // ------------------------------------------------------

    // By default, lint all the files.
    grunt.registerTask( 'lint', [ 'jsonmin:jshint', 'jshint', 'clean:jshint' ] );

    grunt.registerTask( 'default', [ 'lint' ] );
};

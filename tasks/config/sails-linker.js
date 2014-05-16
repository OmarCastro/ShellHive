/**
 * Autoinsert script tags (or other filebased tags) in an html file.
 *
 * ---------------------------------------------------------------
 *
 * Automatically inject <script> tags for javascript files and <link> tags
 * for css files.  Also automatically links an output file containing precompiled
 * templates using a <script> tag.
 *
 * For usage docs see:
 * 		https://github.com/Zolmeister/grunt-sails-linker
 *
 */


module.exports = function(grunt) {

	grunt.config.set('sails-linker', require("../sails-linker-ejs"))

	grunt.loadNpmTasks('grunt-sails-linker');
};

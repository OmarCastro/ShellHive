var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {
  
  grunt.initConfig({
    concat: {
      js: {
        options: {
          separator: ';'
        },
        src: [
          'javascript/*.js'
        ],
        dest: 'public/js/main.min.js'
      },
    },
    'closure-compiler': {
      frontend: {
        closurePath: 'closure-compiler',
        js: 'public/js/script.ls.js',
        jsOutputFile: 'public/js/script.min.js',
        maxBuffer: 500,
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    },
    livescript: {
      home_js: {
        files: {
          'public/js/script.ls.js': ['livescript/home/*.ls']
        }
      },
      helper_js:{
        files: {
          'public/js/helper.ls.js': ['livescript/helper/*.ls']
        }
      }
    },
    watch: {
      html: {
        files: ['elements/*.jade'],
        tasks: ['jade']
      },
      home_js: {
        files: ['livescript/home/*.ls'],
        tasks: ['livescript:home_js', 'closure-compiler']
      },
      helper: {
        files: ['livescript/helper/*.ls'],
        tasks: ['livescript:helper_js']
      },
      css: {
        files: ['stylus/*.styl'],
        tasks: ['stylus:style']
      }
    }
  });
 
  grunt.loadNpmTasks('grunt-livescript');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-closure-compiler');
  grunt.registerTask('default', [ 'watch' ]);

 
};
 

(function(){
  var fs, path, exec;
  fs = require('fs');
  path = require('path');
  exec = require('child_process').exec;
  module.exports = function(grunt){
    var config;
    config = {
      jade: {
        compile: {
          options: {
            data: {
              debug: false
            }
          },
          files: {
            "public/weeklyReport2.html": ["public/weeklyReport2.jade"]
          }
        }
      },
      livescript: {
        home_js: {
          files: {
            'public/js/script.ls.js': ['livescript/home/*.ls']
          }
        },
        helper_js: {
          files: {
            'public/js/helper.ls.js': ['livescript/helper/*.ls']
          }
        },
        grunt: {
          files: {
            'Gruntfile.js': ['livescript/grunt.ls']
          }
        },
        parser: {
          files: {
            'parser/parser.js': ['parser/parser.ls']
          }
        },
        report: {
          files: {
            'public/js2/app.js': ['public/js2/play.ls']
          }
        }
      },
      shell: {
        compileLsParser: {
          options: {
            stdout: true,
            stderr: true
          },
          command: "ls parser/commands/dev/ | parallel 'find parser/commands/dev/{} -newer parser/commands/v/{.}.js' | parallel 'basename {}' | parallel 'lsc -p -b -c parser/commands/dev/{} > parser/commands/v/{.}.js'"
        },
        glueParser: {
          command: "gluejs --no-cache --global shellParser --main parser/parser.js --include parser/commands/v/ --include parser/parser.js --include parser/ast-builder/ast-builder.js > public/js/parser.js"
        }
      },
      watch: {
        report_html: {
          files: ["public/weeklyReport2.jade", "public/component.jade"],
          tasks: ['jade:compile']
        },
        report: {
          files: ['public/js2/play.ls'],
          tasks: ['livescript:report']
        },
        parserCommands: {
          files: ['parser/commands/dev/*.ls'],
          tasks: ['shell:compileLsParser', 'shell:glueParser']
        },
        parser: {
          files: ['parser/parser.ls'],
          tasks: ['livescript:parser', 'shell:glueParser']
        },
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
        gruntfile: {
          files: ['livescript/grunt.ls'],
          tasks: ['livescript:grunt']
        }
      }
    };
    grunt.initConfig(config);
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-livescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerTask('default', ['watch']);
  };
}).call(this);

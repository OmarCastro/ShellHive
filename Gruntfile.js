(function(){
  var fs, path, exec;
  fs = require('fs');
  path = require('path');
  exec = require('child_process').exec;
  module.exports = function(grunt){
    var config;
    config = {
      stylus: {
        reports: {
          files: {
            'public/reports/css/style.css': ['views/css/style.styl', 'public/reports/style.styl']
          }
        }
      },
      jade: {
        compile: {
          options: {
            data: {
              debug: false
            }
          },
          files: {
            "public/reports/weeklyReport5.html": ["public/reports/weeklyReport5.jade"],
            "public/reports/demo1.html": ["public/reports/demo1.jade"]
          }
        }
      },
      ts: {
        common: {
          src: ['src/**/*.ts'], 
          outDir: 'target/',
          options: {
            module: 'commonjs',
            target: 'es5',
            fast:false,
            verbose: true
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
        parser: {
          files: {
            'target/parser/parser.js': ['src/parser/parser.ls']
          }
        },
        commands: {
          options: {
            bare: true
          },
          expand: true,
          flatten: true,
          cwd: 'src/parser/commands/',
          src: ['*.ls'],
          dest: 'target/parser/commands/',
          ext: '.js'
        },
        server: {
          expand: true,
          flatten: true,
          cwd: 'livescript/server/',
          src: ['*.ls'],
          dest: 'server',
          ext: '.js'
        },
        report: {
          options: {
            bare: true
          },
          files: {
            'public/reports/js5/reportApp.js': ['livescript/weeklyReport/init.ls', 'livescript/weeklyReport/reportInit.ls', 'livescript/weeklyReport/play.ls', 'livescript/angularjs/directives/*.ls']
          }
        },
        demo: {
          options: {
            bare: true
          },
          files: {
            'public/reports/js5/demoApp.js': ['livescript/weeklyReport/init.ls', 'livescript/weeklyReport/demoInit2.ls', 'livescript/angularjs/directives/*.ls']
          }
        },
        demoServer: {
          options: {
            bare: true
          },
          files: {
            'public/reports/js5/demoApp.js': ['livescript/weeklyReport/init.ls', 'livescript/weeklyReport/demoInit.ls', 'livescript/angularjs/directives/*.ls']
          }
        }
      },
      shell: {
        glueParser: {
          options: {
            stdout: true,
            stderr: true,
            failOnError: true
          },
          command: "browserify target/parser/shellParser.js | tee public/js/parser.js > public/reports/js5/parser.js"
        }
      },
      watch: {
        report_html: {
          files: ["public/reports/*.jade"],
          tasks: ['jade:compile']
        },
        server: {
          files: ['livescript/server/*.ls'],
          tasks: ['livescript:server']
        },
        report_css: {
          files: ['public/reports/style.styl', 'views/css/style.styl'],
          tasks: ['stylus:reports']
        },
        report: {
          files: ['livescript/weeklyReport/*.ls', 'livescript/angularjs/**/*.ls'],
          tasks: ['livescript:report', 'livescript:demoServer']
        },
        parser: {
          files: ['src/**/*.ts','src/parser/**/*.ls'],
          tasks: ['ts:common','newer:livescript:commands', 'shell:glueParser']
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
      }
    };
    grunt.initConfig(config);
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-livescript');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerTask('default', ['watch']);
  };
}).call(this);

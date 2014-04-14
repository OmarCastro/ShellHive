fs = require('fs')
path = require('path')
exec = require('child_process').exec
module.exports = (grunt) !->
  config = 
    stylus:
      reports:
        files:
          'public/reports/css/style.css':['views/css/style.styl','public/reports/style.styl']
    jade:
      compile:
        options:
          data:
            debug: false
        files:
          "public/reports/weeklyReport5.html": ["public/reports/weeklyReport5.jade"]
          "public/reports/demo1.html": ["public/reports/demo1.jade"]
    livescript:
      home_js:   files: 'public/js/script.ls.js': ['livescript/home/*.ls']
      helper_js: files: 'public/js/helper.ls.js': ['livescript/helper/*.ls']
      grunt:     files: 'Gruntfile.js'          : ['livescript/grunt.ls']
      parser:    files: 'target/parser/parser.js'      : ['src/parser/parser.ls']
      
      utilities: 
        options:{+bare}      
        expand: true,
        flatten: true,
        cwd: 'src/parser/utils/',
        src: ['*.ls'],
        dest: 'target/parser/utils/',
        ext: '.js'

      common:  
        options:{+bare}       
        expand: true,
        flatten: true,
        cwd: 'src/common/',
        src: ['*.ls'],
        dest: 'target/common/',
        ext: '.js'
      
      commands:  
        options:{+bare}       
        expand: true,
        flatten: true,
        cwd: 'src/parser/commands/',
        src: ['*.ls'],
        dest: 'target/parser/commands/',
        ext: '.js'
      server:
        expand: true,
        flatten: true,
        cwd: 'livescript/server/',
        src: ['*.ls'],
        dest: 'server',
        ext: '.js'
      report:
        options:{+bare}    
        files: 
          'public/reports/js5/reportApp.js':
            'livescript/weeklyReport/init.ls'
            'livescript/weeklyReport/reportInit.ls'
            'livescript/weeklyReport/play.ls'
            'livescript/angularjs/directives/*.ls'
      demo:
        options:{+bare}    
        files: 
          'public/reports/js5/demoApp.js':
            'livescript/weeklyReport/init.ls'
            'livescript/weeklyReport/demoInit.ls'
            'livescript/angularjs/directives/*.ls'
      demoServer:
        options:{+bare}    
        files: 
          'public/reports/js5/demoApp.js':
            'livescript/weeklyReport/init.ls'
            'livescript/weeklyReport/demoInit.ls'
            'livescript/angularjs/directives/*.ls'
    shell:
      glueParser: 
        options:{+stdout,+stderr,+failOnError}
        command: "browserify target/parser/shellParser.js | tee public/js/parser.js > public/reports/js5/parser.js"


    watch:
      report_html:
        files: ["public/reports/*.jade"]
        tasks: ['jade:compile']
      server:
        files:['livescript/server/*.ls']
        tasks:['livescript:server']
      report_css:
        files:['public/reports/style.styl','views/css/style.styl']
        tasks:['stylus:reports']
      report:
        files: ['livescript/weeklyReport/*.ls','livescript/angularjs/**/*.ls']
        tasks: ['livescript:report','livescript:demo'] 
      common:
        files: ['src/common/**/*.ls']
        tasks:
          'newer:livescript:common'
          'shell:glueParser'
      parserCommands:
        files: ['src/parser/**/*.ls']
        tasks:
          'newer:livescript:parser'
          'newer:livescript:commands'
          'newer:livescript:utilities'
          'shell:glueParser'
      html:
        files: ['elements/*.jade']
        tasks: ['jade']
      home_js:
        files: ['livescript/home/*.ls']
        tasks: ['livescript:home_js', 'closure-compiler']
      helper:
        files: ['livescript/helper/*.ls']
        tasks: ['livescript:helper_js']
      gruntfile: 
        files: ['livescript/grunt.ls']
        tasks: ['livescript:grunt']     
      
  grunt.initConfig config
  grunt.loadNpmTasks \grunt-newer
  grunt.loadNpmTasks \grunt-browserify  
  grunt.loadNpmTasks \grunt-contrib-watch
  grunt.loadNpmTasks \grunt-contrib-stylus
  grunt.loadNpmTasks \grunt-contrib-jade
  grunt.loadNpmTasks \grunt-livescript
  grunt.loadNpmTasks \grunt-shell
  grunt.registerTask \default, <[ watch ]>

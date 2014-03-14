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
          "public/reports/weeklyReport4.html": ["public/reports/weeklyReport4.jade"]
          "public/reports/demo1.html": ["public/reports/demo1.jade"]
    livescript:
      home_js:   files: 'public/js/script.ls.js': ['livescript/home/*.ls']
      helper_js: files: 'public/js/helper.ls.js': ['livescript/helper/*.ls']
      grunt:     files: 'Gruntfile.js'          : ['livescript/grunt.ls']
      parser:    files: 'parser/parser.js'      : ['parser/parser.ls']
      report:
        options:{+bare}    
        files: 
          'public/reports/js4/reportApp.js':
            'livescript/weeklyReport/init.ls'
            'livescript/weeklyReport/reportInit.ls'
            'livescript/weeklyReport/play.ls'
            'livescript/angularjs/directives/*.ls'
      demo:
        options:{+bare}    
        files: 
          'public/reports/js4/demoApp.js':
            'livescript/weeklyReport/init.ls'
            'livescript/weeklyReport/demoInit.ls'
            'livescript/weeklyReport/directives.ls'
    shell:
      compileLsParser:
        options:{+stdout,+stderr,+failOnError}
        command: "ls parser/commands/dev/
                  | grep '\\.ls' 
                  | parallel 'test -e parser/commands/v/{.}.js || touch parser/commands/v/{.}.js; find parser/commands/dev/{} -newer parser/commands/v/{.}.js' 
                  | parallel 'basename {}' 
                  | parallel 'lsc -p -b -c parser/commands/dev/{} > parser/commands/v/{.}.js'" 
      glueParser: 
        command: "gluejs 
                 --no-cache 
                 --global shellParser 
                 --main parser/parser.js 
                 --include parser/commands/v/ 
                 --include parser/parser.js 
                 --include parser/ast-builder/ast-builder.js 
                 | tee public/js/parser.js > public/reports/js4/parser.js"


    watch:
      report_html:
        files: [
          "public/reports/weeklyReport4.jade"
          "public/reports/MacroCreationModal.jade"
          "public/reports/sidebar.jade"
          "public/reports/demo1.jade"
          "public/reports/component.jade"
          "public/reports/graph.jade"]
        tasks: ['jade:compile'] 
      report_css:
        files:['public/reports/style.styl','views/css/style.styl']
        tasks:['stylus:reports']
      report:
        files: ['livescript/weeklyReport/*.ls','livescript/angularjs/**/*.ls']
        tasks: ['livescript:report']        
      parserCommands:
        files: ['parser/commands/dev/*.ls']
        tasks: ['shell:compileLsParser','shell:glueParser']
      parser:
        files: ['parser/parser.ls']
        tasks: ['livescript:parser','shell:glueParser']
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
  grunt.loadNpmTasks \grunt-contrib-watch
  grunt.loadNpmTasks \grunt-contrib-stylus
  grunt.loadNpmTasks \grunt-contrib-jade
  grunt.loadNpmTasks \grunt-livescript
  grunt.loadNpmTasks \grunt-shell
  grunt.registerTask \default, <[ watch ]>

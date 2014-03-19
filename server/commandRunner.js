(function(){
  var util, spawn, command_interpreter, rootDirectory, Runner;
  util = require('util');
  spawn = require('child_process').spawn;
  command_interpreter = "bash";
  rootDirectory = __dirname + "/../workspace";
  module.exports = Runner = (function(){
    Runner.displayName = 'Runner';
    var prototype = Runner.prototype, constructor = Runner;
    function Runner(command){
      var process, _this;
      console.log(rootDirectory);
      process = spawn(command_interpreter, ['-c', command], {
        cwd: rootDirectory
      });
      _this = this;
      _this.onStdOut = function(data){
        console.log(data.toString('utf8'));
      };
      _this.onStdErr = function(data){
        console.error(data.toString('utf8'));
      };
      _this.onExit = function(code){
        console.log("command \"" + command + "\" finished with code " + code + " ");
      };
      process.stdout.on('data', function(data){
        _this.onStdOut(data);
      });
      process.stderr.on('data', function(data){
        _this.onStdErr(data);
      });
      process.on('exit', function(code){
        _this.onExit(code);
      });
    }
    Runner.run = function(command){
      return new Runner(command);
    };
    return Runner;
  }());
}).call(this);

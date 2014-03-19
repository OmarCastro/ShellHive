util  = require('util')
spawn = require('child_process').spawn


command_interpreter = "bash"
rootDirectory = __dirname + "/../workspace"

module.exports = class Runner
  (command) ->
    console.log rootDirectory
    process = spawn command_interpreter, ['-c', command] {cwd: rootDirectory}
    _this = this
    _this <<< {
        onStdOut: (data) !-> console.log data.toString('utf8')
        onStdErr: (data) !-> console.error data.toString('utf8')
        onExit  : (code) !-> console.log """command "#{command}" finished with code #{code} """
    }
    process.stdout.on 'data', (data) !-> _this.onStdOut(data)
    process.stderr.on 'data', (data) !-> _this.onStdErr(data)
    process.on 'exit', (code) !-> _this.onExit(code)
  this.run = (command) -> new Runner(command)

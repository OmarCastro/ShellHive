var spawn = require('child_process').spawn;

function escape(command){
	command.split("\\").join("\\\\").split('"').join('\\"')
}

/**
* ExecutionService.js
*
* @description :: Service that takes care of executing the commands in a linux container.
* @docs        :: http://sailsjs.org/#!documentation/services
*/
module.exports = {
	execute:function execute (command,cwd) {
		var exec = "docker";
		var arguments = ['run','ubuntu','bash','-c'];
		arguments.push(escape(command));

		return spawn(exec,arguments,{cwd:cwd});
	},
	/**
		this function is to be used on development only
		on production is a good idea to use a container engine
	*/
	executeUnsafe:function execute (command,cwd) {
		var exec = "bash";
		var arguments = ['-c'];
		arguments.push(escape(command));
		return spawn(exec,arguments, {cwd:cwd});
	}
}
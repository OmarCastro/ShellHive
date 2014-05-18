var spawn = require('child_process').spawn;
var path = require('path');

function escape(command){
	return command.split("\\").join("\\\\").split('"').join('\\"')
}


/* istanbul ignore next: function to test with 'sails console' */
function debugChildProcess(child){
	child.stdout.on("data", function(data){sails.log.debug(data.toString())})
	child.stderr.on("data", function(data){sails.log.error(data.toString())})
	child.on("exit", function(code){sails.log.info("command finished with code ",code)})	
}
/* istanbul ignore next: function to test with 'sails console' */
function sailsExecuteWithDocker (command,projectId){
	debugChildProcess(ExecutionService.executeWithDocker(command,projectId))
}
/* istanbul ignore next: function to test with 'sails console' */
function sailsExecuteFromShell(command,projectId){
	debugChildProcess(ExecutionService.executeFromShell(command,projectId))
}
/* istanbul ignore next: function to test with 'sails console' */
function sailsExecute(command,projectId){
	debugChildProcess(ExecutionService.execute(command,projectId))
}


/**
* ExecutionService.js
*
* @description :: Service that takes care of executing the commands in a linux container.
* @docs        :: http://sailsjs.org/#!documentation/services
*/
module.exports = {

	execute: function execute (command,projectId){
		/* istanbul ignore if: stay as that untill I find a CI that supports docker */
		if (sails.config.shusee.useDocker){
			return ExecutionService.executeWithDocker(command,projectId)
		} else {
			return ExecutionService.executeFromShell(command,projectId);
		}
	},

	executeWithDocker:		
	/* istanbul ignore next: stay as that untill I find a CI that supports docker */
	function executeWithDocker (command,projectId) {
		projectId = projectId + '';
		var config = sails.config.shusee;
		var fsPath = config.fsPath;

		var dockerConfig = config.dockerConfig;
		var exec = dockerConfig.executable;
		var image = dockerConfig.image;
		var sh = dockerConfig.sh || config.sh;
		var dockerPath = dockerConfig.dockerPath;
		var cwd = path.resolve(fsPath,'projects',projectId)

		var dockerCommand = escape("cd " + dockerPath + ' ; ' + command)
		
		var args = ['run','-v',[cwd,dockerPath].join(':'),image,sh,'-c',dockerCommand];
		sails.log("running command - ",exec, args, 'on project', projectId)
		return spawn(exec,args);
	},

	executeFromShell:function executeFromShell (command,projectId) {
		projectId = projectId + '';
		var config = sails.config.shusee;
		var fsPath = config.fsPath;
		var exec = config.sh;
		var cwd = path.resolve(fsPath,'projects',projectId)

		var args = ['-c',escape(command)];
		sails.log("running command - ",exec, args.slice(0,-1).join(" "), '"'+args.slice(-1)+ '" on project', projectId)
		return spawn(exec,args, {cwd:cwd});
	},

	sailsExecuteWithDocker:  sailsExecuteWithDocker,
	sailsExecuteFromShell: sailsExecuteFromShell,
	sailsExecute:sailsExecute
}
export function sanitizeCommand(commandString){
	return commandString.split("'").join("'\"'\"'")
}

export function sanitizeArgument(commandArg){
	if (/[\ #\$\`\'\"\\]/.test(commandArg)){
		return "'" + sanitizeCommand(commandArg) + "'"
	}
	else return commandArg;
}

export function sanitizedWithSingleQuotes(commandArg){
	return commandArg[0] == commandArg[commandArg.length -1]
		&& commandArg[0] == "'";
}


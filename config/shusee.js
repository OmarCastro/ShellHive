/**
 * ShellHive UNIX Shell Execution Environment (SHUSEE)
 *
 * The SHUSEE saves the information of the data to be saved here
 */

module.exports.shusee = {
	// path used by ShellHive to manage projects
	fsPath: "fs",

	sh: "bash",

	/*
	 * Docer is a container engine that allows commands
	 * to be executed in a container without compromissing performance
	 */
	useDocker: true,

	// configurations to the usage of docker
	dockerConfig: {
		// the executable of the Docker container engine
		executable: "docker",
		// image to use by Deocker to run the commands
		image: "ubuntu",
		// shell executable to execute the projects inside Docker
		// if not defined, uses the same as the above "sh" config
		sh: null,
		// the path used by docker to execute the commands, must be an
		// absolute path due to how docker works
		dockerPath: "/home"
	}
}
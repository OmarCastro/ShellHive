module.exports = function (grunt) {
	grunt.registerTask('linkAssets', [
		'sails-linker:devJs',
		'sails-linker:devJsApp',
		'sails-linker:devStyles',
		'sails-linker:devTpl'
	]);
};

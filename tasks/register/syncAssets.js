module.exports = function (grunt) {
	grunt.registerTask('syncAssets', [
		'jst:dev',
		'less:dev',
		'autoprefixer:dev',
		'sync:dev',
		'coffee:dev'
	]);
};



module.exports = function(grunt) {

	grunt.config.set('autoprefixer', {
		dev: {
			src: '.tmp/public/styles/*.css'
		}
	});

	grunt.loadNpmTasks('grunt-autoprefixer');
};
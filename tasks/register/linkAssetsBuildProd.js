module.exports = function (grunt) {
	grunt.registerTask('linkAssetsBuildProd', [
		'sails-linker:prodJsRelative',
		'sails-linker:prodJsAppRelative',
		'sails-linker:prodStylesRelative',
		'sails-linker:devTpl'
	]);
};

module.exports = {
		devJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': require('./pipeline').jsFilesToInject,
				'views/**/*.html': require('./pipeline').jsFilesToInject,
				'views/**/*.ejs': require('./pipeline').jsFilesToInject
			}
		},

		devJsApp: {
			options: {
				startTag: '<!--ANGULAR SCRIPTS-->',
				endTag: '<!--ANGULAR SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': require('./pipeline').appJsFilesToInject,
				'views/**/*.html': require('./pipeline').appJsFilesToInject,
				'views/**/*.ejs': require('./pipeline').appJsFilesToInject
			}
		},

		devJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': require('./pipeline').jsFilesToInject,
				'views/**/*.html': require('./pipeline').jsFilesToInject,
				'views/**/*.ejs': require('./pipeline').jsFilesToInject
			}
		},

		devJsAppRelative: {
			options: {
				startTag: '<!--ANGULAR SCRIPTS-->',
				endTag: '<!--ANGULAR SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': require('./pipeline').appJsFilesToInject,
				'views/**/*.html': require('./pipeline').appJsFilesToInject,
				'views/**/*.ejs': require('./pipeline').appJsFilesToInject
			}
		},

		prodJs: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.js'],
				'views/**/*.html': ['.tmp/public/min/production.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.js']
			}
		},

		prodJsApp: {
			options: {
				startTag: '<!--ANGULAR SCRIPTS-->',
				endTag: '<!--ANGULAR SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/approduction.js'],
				'views/**/*.html': ['.tmp/public/min/approduction.js'],
				'views/**/*.ejs': ['.tmp/public/min/approduction.js']
			}
		},

		prodJsRelative: {
			options: {
				startTag: '<!--SCRIPTS-->',
				endTag: '<!--SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/production.js'],
				'views/**/*.html': ['.tmp/public/min/production.js'],
				'views/**/*.ejs': ['.tmp/public/min/production.js']
			}
		},

		prodJsAppRelative: {
			options: {
				startTag: '<!--ANGULAR SCRIPTS-->',
				endTag: '<!--ANGULAR SCRIPTS END-->',
				fileTmpl: '<script src="%s"></script>',
				appRoot: '.tmp/public',
				relative: true

			},
			files: {
				'.tmp/public/**/*.html': ['.tmp/public/min/approduction.js'],
				'views/**/*.html': ['.tmp/public/min/approduction.js'],
				'views/**/*.ejs': ['.tmp/public/min/approduction.js']
			}
		},

		devStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public'
			},

			files: {
				'.tmp/public/**/*.html': require('./pipeline').cssFilesToInject,
				'views/**/*.html': require('./pipeline').cssFilesToInject,
				'views/**/*.ejs': require('./pipeline').cssFilesToInject
			}
		},

		devStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},

			files: {
				'.tmp/public/**/*.html': require('./pipeline').cssFilesToInject,
				'views/**/*.html': require('./pipeline').cssFilesToInject,
				'views/**/*.ejs': require('./pipeline').cssFilesToInject
			}
		},

		prodStyles: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.css'],
				'views/**/*.html': ['.tmp/public/min/production.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.css']
			}
		},

		prodStylesRelative: {
			options: {
				startTag: '<!--STYLES-->',
				endTag: '<!--STYLES END-->',
				fileTmpl: '<link rel="stylesheet" href="%s">',
				appRoot: '.tmp/public',
				relative: true
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/min/production.css'],
				'views/**/*.html': ['.tmp/public/min/production.css'],
				'views/**/*.ejs': ['.tmp/public/min/production.css']
			}
		},

		// Bring in JST template object
		devTpl: {
			options: {
				startTag: '<!--TEMPLATES-->',
				endTag: '<!--TEMPLATES END-->',
				fileTmpl: '<script type="text/javascript" src="%s"></script>',
				appRoot: '.tmp/public'
			},
			files: {
				'.tmp/public/index.html': ['.tmp/public/jst.js'],
				'views/**/*.html': ['.tmp/public/jst.js'],
				'views/**/*.ejs': ['.tmp/public/jst.js']
			}
		}
	}
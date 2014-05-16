module.exports = {
  devJs: {
    options: {
      startTag: '// SCRIPTS',
      endTag: '// SCRIPTS END',
      fileTmpl: 'script(type="text/javascript", src="%s")',
      appRoot: '.tmp/public'
    },
    files: {
      'views/**/*.jade': require('./pipeline').jsFilesToInject,
    }
  },

  prodJs: {
    options: {
      startTag: '// SCRIPTS',
      endTag: '// SCRIPTS END',
      fileTmpl: 'script(type="text/javascript", src="%s")',
      appRoot: '.tmp/public'
    },
    files: {
      'views/**/*.jade': ['.tmp/public/min/production.js']
    }
  },

  devStyles: {
    options: {
      startTag: '// STYLES',
      endTag: '// STYLES END',
      fileTmpl: 'link(rel="stylesheet", href="%s")',
      appRoot: '.tmp/public'
    },
    files: {
      'views/**/*.jade': require('./pipeline').cssFilesToInject,
    }
  },

  prodStyles: {
    options: {
      startTag: '// STYLES',
      endTag: '// STYLES END',
      fileTmpl: 'link(rel="stylesheet", href="%s")',
      appRoot: '.tmp/public'
    },
    files: {
      'views/**/*.jade': ['.tmp/public/min/production.css']
    }
  },

  // Bring in JST template object
  devTpl: {
    options: {
      startTag: '// TEMPLATES',
      endTag: '// TEMPLATES END',
      fileTmpl: 'script(type="text/javascript", src="%s")',
      appRoot: '.tmp/public'
    },
    files: {
      'views/**/*.jade': ['.tmp/public/jst.js']
    }
  }
}
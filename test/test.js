
global.chai = require('chai');

chai.use(require('chai-as-promised'));
chai.use(require('chai-properties'));

require('./parser/common')
require('./parser/parser')
require('./parser/AST')
require('./parser/Graph')
require('./parser/SimpleCommands')

//require('./sails/basic')

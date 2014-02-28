parser = require("./parser");

var catData = parser.parseCommand("cat -s -A cat.txt grep.txt");
console.log(catData);
console.log(parser.parseComponent(catData[0])); 

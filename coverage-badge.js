var green = [147,188,59];
var yellow = [166,157,0];
var red = [189,0,2];

var exec = require('child_process').exec;

function getColor(coverage) {
  coverage = Math.floor(Number(coverage));
  var ratio = coverage/100;
  if (coverage > 90)
    return mixColors(yellow, green, (coverage-90)/10);
  if (coverage > 80)
    return mixColors(red, yellow, (coverage-80)/10);
  return createColor(red);
}

function mixColors(from, to, ratio) {
  var result = [], i;
  for (i=0; i<3; i++)
    result[i] = Math.round(from[i] + (ratio * (to[i]-from[i])));
  return createColor(result);
}

function createColor(values) {
  return Color(values[0])+Color(values[1])+Color(values[2])
} 

function Color(value){
  value = value.toString(16)
  if(!value[1]) value = "0"+value
  return value
}

var args = process.argv.splice(2);

if (require.main === module) {
  if (args.length === 0) {
    console.log("Usage: node color.js coverage");
  } else{
    args[0] = Math.floor(Number(args[0]));
  	var url = "http://img.shields.io/badge/coverage-"+args[0]+"-"+getColor(args[0])+".svg"
  	if(args[1]){
  		url += "?style="+args[1]
  	}
  	exec("curl "+ url,function (error, stdout, stderr) {
    	console.log(stdout);
    	if (error !== null) {
      		console.log('exec error: ' + error);
    	}
	});

  }
}
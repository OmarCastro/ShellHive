"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var awk_1 = require("./awk");
var cat = require("./cat");
var curl = require("./curl");
var date = require("./date");
var diff = require("./diff");
var echo = require("./echo");
var bunzip2 = require("./bunzip2");
var bzcat = require("./bzcat");
var bzip2 = require("./bzip2");
var grep = require("./grep");
var ls = require("./ls");
var compress = require("./compress");
var sort = require("./sort");
var gzip = require("./gzip");
var gunzip = require("./gunzip");
var zcat = require("./zcat");
var head = require("./head");
var tail = require("./tail");
var tr = require("./tr");
var tee = require("./tee");
var uniq = require("./uniq");
var wc = require("./wc");
exports.parserCommand = {
    awk: awk_1.commandParser, cat: cat, curl: curl, date: date, diff: diff, echo: echo, bunzip2: bunzip2, bzcat: bzcat, bzip2: bzip2, grep: grep, ls: ls, compress: compress, sort: sort, gzip: gzip, gunzip: gunzip, zcat: zcat, head: head, tail: tail, tr: tr, tee: tee, uniq: uniq, wc: wc
};
exports.visualSelectorOptions = Object
    .keys(exports.parserCommand)
    .map(function (commandName) { return { key: commandName, value: exports.parserCommand[commandName].visualSelectorOptions }; })
    .filter(function (command) { return command.value != null; })
    .reduce(function (obj, command) { obj[command.key] = command.value; return obj; }, {});

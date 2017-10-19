"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _common_imports_1 = require("./_common.imports");
/*

NAME
       diff - compare files line by line

SYNOPSIS
       diff [OPTION]... FILES

DESCRIPTION
       Compare FILES line by line.

       Mandatory arguments to long options are mandatory for short options too.

       --normal
              output a normal diff (the default)

       -q, --brief
              report only when files differ

       -s, --report-identical-files
              report when two files are the same

       -c, -C NUM, --context[=NUM]
              output NUM (default 3) lines of copied context

       -u, -U NUM, --unified[=NUM]
              output NUM (default 3) lines of unified context

       -e, --ed
              output an ed script

       -n, --rcs
              output an RCS format diff

       -y, --side-by-side
              output in two columns

       -W, --width=NUM
              output at most NUM (default 130) print columns

       --left-column
              output only the left column of common lines

       --suppress-common-lines
              do not output common lines

       -p, --show-c-function
              show which C function each change is in

       -F, --show-function-line=RE
              show the most recent line matching RE

       --label LABEL
              use LABEL instead of file name (can be repeated)

       -t, --expand-tabs
              expand tabs to spaces in output

       -T, --initial-tab
              make tabs line up by prepending a tab

       --tabsize=NUM
              tab stops every NUM (default 8) print columns

       --suppress-blank-empty
              suppress space or tab before empty output lines

       -l, --paginate
              pass output through `pr' to paginate it

       -r, --recursive
              recursively compare any subdirectories found

       -N, --new-file
              treat absent files as empty

       --unidirectional-new-file
              treat absent first files as empty

       --ignore-file-name-case
              ignore case when comparing file names

       --no-ignore-file-name-case
              consider case when comparing file names

       -x, --exclude=PAT
              exclude files that match PAT

       -X, --exclude-from=FILE
              exclude files that match any pattern in FILE

       -S, --starting-file=FILE
              start with FILE when comparing directories

       --from-file=FILE1
              compare FILE1 to all operands; FILE1 can be a directory

       --to-file=FILE2
              compare all operands to FILE2; FILE2 can be a directory

       -i, --ignore-case
              ignore case differences in file contents

       -E, --ignore-tab-expansion
              ignore changes due to tab expansion

       -b, --ignore-space-change
              ignore changes in the amount of white space

       -w, --ignore-all-space
              ignore all white space

       -B, --ignore-blank-lines
              ignore changes whose lines are all blank

       -I, --ignore-matching-lines=RE
              ignore changes whose lines all match RE

       -a, --text
              treat all files as text

       --strip-trailing-cr
              strip trailing carriage return on input

       -D, --ifdef=NAME
              output merged file with `#ifdef NAME' diffs

       --GTYPE-group-format=GFMT
              format GTYPE input groups with GFMT

       --line-format=LFMT
              format all input lines with LFMT

       --LTYPE-line-format=LFMT
              format LTYPE input lines with LFMT

              These format options provide fine-grained control over the output

              of diff, generalizing -D/--ifdef.

       LTYPE is `old', `new', or `unchanged'.
              GTYPE is LTYPE or `changed'.

              GFMT (only) may contain:

       %<     lines from FILE1

       %>     lines from FILE2

       %=     lines common to FILE1 and FILE2

       %[-][WIDTH][.[PREC]]{doxX}LETTER
              printf-style spec for LETTER

              LETTERs are as follows for new group, lower case for old group:

       F      first line number

       L      last line number

       N      number of lines = L-F+1

       E      F-1

       M      L+1

       %(A=B?T:E)
              if A equals B then T else E

              LFMT (only) may contain:

       %L     contents of line

       %l     contents of line, excluding any trailing newline

       %[-][WIDTH][.[PREC]]{doxX}n
              printf-style spec for input line number

              Both GFMT and LFMT may contain:

       %%     %

       %c'C'  the single character C

       %c'\OOO'
              the character with octal code OOO

       C      the character C (other characters represent themselves)

       -d, --minimal
              try hard to find a smaller set of changes

       --horizon-lines=NUM
              keep NUM lines of the common prefix and suffix

       --speed-large-files
              assume large files and many scattered small changes

       --help display this help and exit

       -v, --version
              output version information and exit

       FILES  are  `FILE1  FILE2'  or  `DIR1  DIR2'  or `DIR FILE...' or `FILE... DIR'.  If
       --from-file or --to-file is given, there are no restrictions on FILE(s).  If a  FILE
       is  `-', read standard input.  Exit status is 0 if inputs are the same, 1 if differ‐
       ent, 2 if trouble.


*/
var selectors = {
    format: {
        name: "format",
        description: "select attribute to sort",
        options: {
            normal: {
                name: 'normal',
                option: null,
                longOption: 'normal',
                description: 'do not print line numbers',
                default: true
            },
            RCS: {
                name: 'RCS',
                option: 'n',
                longOption: 'rcs',
                description: 'print line numbers on all lines'
            },
            edScript: {
                name: 'ed script',
                option: 'e',
                longOption: 'ed',
                description: 'print line numbers on non empty lines'
            }
        }
    },
};
var flags = {
    ignoreCase: {
        name: "ignore case",
        option: 'i',
        longOption: 'ignore-case',
        description: "print TAB characters like ^I",
        active: false
    },
    ignoreBlankLines: {
        name: "ignore blank lines",
        option: 'B',
        longOption: 'ignore-blank-lines',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    ignoreSpaceChange: {
        name: "ignore space change",
        option: 'b',
        longOption: 'ignore-blank-sapce',
        description: "suppress repeated empty output lines",
        active: false
    },
};
var config = {
    selectors: selectors,
    flags: flags
};
var bzipData = new _common_imports_1.ParserData(config);
var optionsParser = _common_imports_1.$.optionParserFromConfig(config);
var shortOptions = optionsParser.shortOptions;
shortOptions['q'] = _common_imports_1.$.ignore;
var longOptions = optionsParser.shortOptions;
longOptions['brief'] = shortOptions['q'];
var DiffComponent = (function (_super) {
    __extends(DiffComponent, _super);
    function DiffComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.exec = "diff";
        _this.files = [];
        return _this;
    }
    return DiffComponent;
}(_common_imports_1.CommandComponent));
exports.DiffComponent = DiffComponent;
function defaultComponentData() {
    var graph = new DiffComponent();
    graph.selectors = bzipData.componentSelectors;
    graph.flags = bzipData.componentFlags;
    return graph;
}
;
exports.parseCommand = _common_imports_1.common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = _common_imports_1.common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.visualSelectorOptions = bzipData.visualSelectorOptions;
exports.componentClass = DiffComponent;

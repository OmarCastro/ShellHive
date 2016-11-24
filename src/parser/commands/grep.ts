import {ParserData, Config, $, CommandComponent, common, sanitizer}  from "./_common.imports";


/*
grep:
  Matcher Selection:
    arguments:
      - ["E","--extended-regexp","Interpret PATTERN as an extended regular expression"]
      - ["F","--fixed-strings","Interpret PATTERN as a list of fixed strings, separated by newlines, any of which is to be matched."]
      - ["G","--basic-regexp","Interpret PATTERN as a basic regular expression (BRE, see below).  This is the default."]
      - ["P","--perl-regexp","display $ at end of each line"]
  Matching Control:
    arguments:
        - ["e PATTERN","--regexp=PATTERN","Use PATTERN as the pattern.  This can be used to specify multiple search patterns, or to protect a pattern beginning with a hyphen (-)."]
        - ["f FILE","--file=FILE","Obtain patterns from FILE, one per line.  The empty file contains zero patterns, and therefore matches nothing."]
        - ["i","--ignore-case","Ignore case distinctions in both the PATTERN and the input files."]
        - ["v","--invert-match","Invert the sense of matching, to select non-matching lines."]
        - ["w","--word-regexp"," Select only those lines containing matches that form whole words.  The test is that the matching substring must either be at the beginning of the line, or preceded by a non-
              word constituent character.  Similarly, it must be either at the end of the line or followed by a non-word constituent character.  Word-constituent characters  are  letters,
              digits, and the underscore."]
        - ["x","--line-regexp","Select only those matches that exactly match the whole line."]

*/

var selectors = {
  patternType:{
    name:"pattern type",
    description:"define the pattern to filter",
    options:{
      extRegex:{
        name:"extended regexp",
        option:"E",
        type:'option',
        description:'use pattern as an extended regular expression'
      },
      fixedStrings:{
        name:"fixed strings",
        option:"F",
        type:'option',
        description:'use pattern as a set of expressions separated by lines'
      },
      basicRegex:{
        name:"basic regexp",
        option:null,
        type:'option',
        description:'use pattern as a basic regular expression',
        default:true
      }/*,
      perlRegex:{
        name:"perl regexp",
        option:"=",
        type:'option',
        description:'use pattern as a perl regular expressionn'
      }*/
    }
  },
  match:{
    name:"match",
    description:"",
    options:{
      default:{
        name:"default",
        option:null,
        type:'option',
        description:'do not force the pattern to filter complete words or lines',
        default:true
      },
      word:{
        name:"whole word",
        option:"F",
        type:'option',
        description:'force the pattern to filter complete words'
      },
      line:{
        name:"whole line",
        option:null,
        type:'option',
        description:'force the pattern to filter complete lines',
      }
    }
  }
}


var flags = {
  ignoreCase: {
    name: "ignore case",
    option: 'T',
    description: "print TAB characters like ^I",
    active: false
  },
  invertMatch:{
    name: "invert match",
    option: 'E',
    description: "print $ after each line",
    active: false
  }
}



const shortOptions = {
  E  :  $.select(selectors.patternType, selectors.patternType.options.extRegex),
  F  :  $.select(selectors.patternType, selectors.patternType.options.fixedStrings),
  G  :  $.select(selectors.patternType, selectors.patternType.options.basicRegex),
  i  :  $.switchOn(flags.ignoreCase),
  //P  :  $.select(selectors.patternType, patternTypeSelector.perlRegex),
  v  :  $.switchOn(flags.invertMatch),
  x  :  $.select(selectors.match, selectors.match.options.line),
  w  :  $.selectIfUnselected(selectors.match.name, selectors.match.options.word.name, selectors.match.options.line.name),
  y  :  $.switchOn(flags.ignoreCase)
};
const longOptions = {
  "extended-regexp" : shortOptions.E,
  "fixed-strings" :   shortOptions.F,
  "basic-regexp" :    shortOptions.G,
  //"perl-regexp" :     shortOptions.P,
  "ignore-case" :     shortOptions.i,
  "invert-match" :    shortOptions.v,
  "word-regexp" :     shortOptions.w,
  "line-regexp" :     shortOptions.x
}

var optionsParser = {
  shortOptions, longOptions
}


var config:Config = {
  selectors:selectors,
  flags:flags
}



var grepCommandData = new ParserData(config);




export class GrepComponent extends CommandComponent {
  public exec:string = "grep"
  public files: any[] = []
  public pattern:string = null

}


function defaultComponentData(){
  var graph = new GrepComponent();
  graph.selectors = grepCommandData.componentSelectors
  graph.flags = grepCommandData.componentFlags
  return graph;
};


export var parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
  string: (component, str) => {
    if(component.pattern === null){
      component.pattern = str || ""
    } else {
      return "continue";
    }
  }    
})

export var parseComponent = common.commonParseComponent(grepCommandData.flagOptions,grepCommandData.selectorOptions, null, (component,exec:any[],flags,files:any[]) =>{
  var pattern = component.pattern || ""
  pattern = sanitizer.sanitizeArgument(pattern);
  //console.error(pattern + " - " + files.length );
  //console.error(!!pattern + " - " + !!files.length );
  if(flags){exec = exec.concat(flags)}
  if(pattern && files.length){return exec.concat(pattern,files).join(' ')}
  else if(pattern){return exec.concat(pattern,files).join(' ')}
  else if(files.length){return exec.concat('""',files).join(' ')}
  else return exec.join(' ')
})

export var VisualSelectorOptions = grepCommandData.visualSelectorOptions;
export var componentClass = GrepComponent

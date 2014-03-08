$ = require("./_init.js");


selectors = {
  \sort
  \format
  \show
  indicator-style:  "indicator style"
  time-style:  "time style"
  quoting-style:  "quoting style"
}

## Selectors

sortSelector = { 
  \name
  \noSort : "do not sort"
  \extension
  \size
  \time
  \version
}

formatSelector = {
  \default
  \commas
  \long
}

indicatorStyleSelector = {
  \none,\slash,\classify,
  fileType: "file type"
}

timeStyleSelector = {
  full-iso: \full-iso
  long-iso: \long-iso
  \iso
  \locale
  \format
}

quotingStyleSelector = {
  \literal, \locale, \shell,
  shell-always:"shell-always",
  \c,\escape
}

showSelector = {
  \all,
  almost-all:\almost-all
  \default
}

## Selector Options


sortSelectorOption = { 
  \name : null
  "do not sort": \U
  \extension : \X 
  \size : \S
  \time : \t
  \version : \v
}

formatSelectorOption = {
  \default : null
  \commas : \c
  \long : \l
}

indicatorStyleSelectorOption = {
  \none : null
  \slash : \p
  \classify : \F
  \fileType : "--file-type"
}

timeStyleSelectorOption = {
  \full-iso : "--time-style=full-iso"
  \long-iso : "--time-style=long-iso"
  \iso : "--time-style=iso"
  \locale : "--time-style=locale"
}


quotingStyleSelectorOption = {
  \literal : "--quoting-style=literal"
  \locale :  "--quoting-style=locale"
  \shell :  "--quoting-style=shell"
  "shell-always" :  "--quoting-style=shell-always"
  \c :  "--quoting-style=c"
  \escape :  "--quoting-style=escape"
}

showSelectorOption = {
  \default : null
  \all : \a
  \almost-all : \A
}



const selectorOptions =
  sort: sortSelectorOption
  format: formatSelectorOption
  "indicator style": indicatorStyleSelectorOption
  "time style": timeStyleSelectorOption
  "quoting style": quotingStyleSelectorOption
  show: showSelectorOption

exports.VisualSelectorOptions =
  sort: [value for ,value of sortSelector]
  format: [value for ,value of formatSelector]
  "indicator style": [value for ,value of indicatorStyleSelector]
  "time style": [value for ,value of timeStyleSelector]
  "quoting style": [value for ,value of quotingStyleSelector]
  show: [value for ,value of showSelector]



flags = {
  \reverse
  \context
  humanReadable: "human readable"
  ignore-backups: "ignore backups"
  no-print-owner: "do not print owner"
  no-print-group: "do not print group"
}


flagOptions = {
  \reverse : \r
  \context : \Z
  "human readable": \h
  "ignore backups": \B
  "do not print owner": \g
  "do not print group": \G
}


optionsParser = 
  shortOptions:
    a  :  $.select selectors.show, showSelector.all
    A  :  $.select selectors.show, showSelector.almost-all
    b  :  $.select selectors.quoting-style,  quotingStyleSelector.escape 
    B  :  $.switchOn flags.ignore-backups
    c  :  $.switchOn! 
    C  :  $.justAccept! 
    d  :  $.switchOn!
    D  :  $.justAccept! 
    f  :  $.switchOn! 
    F  :  $.select  selectors.indicator-style, indicatorStyleSelector.classify
    g  :  $.switchOn flags.no-print-owner
    G  :  $.switchOn flags.no-print-group
    h  :  $.switchOn flags.humanReadable
    H  :  $.switchOn! 
    i  :  $.switchOn!
    I  :  $.setParameter \ignore  
    k  :  $.switchOn! 
    l  :  $.select   selectors.format, formatSelector.verbose
    L  :  $.switchOn! 
    m  :  $.select   selectors.format, formatSelector.commas
    n  :  $.switchOn! 
    N  :  $.switchOn! 
    o  :  $.switchOn! 
    p  :  $.select  selectors.indicator-style, indicatorStyleSelector.slash
    q  :  $.switchOn! 
    Q  :  $.switchOn! 
    r  :  $.switchOn flags.reverse
    R  :  $.switchOn! 
    s  :  $.switchOn! 
    S  :  $.select   selectors.sort, sortSelector.size
    t  :  $.select   selectors.sort, sortSelector.time
    T  :  $.switchOn! 
    u  :  $.switchOn! 
    U  :  $.select   selectors.sort, sortSelector.noSort
    v  :  $.select   selectors.sort, sortSelector.extension
    w  :  $.switchOn! 
    x  :  $.switchOn! 
    X  :  $.select   selectors.sort, sortSelector.size
    Z  :  $.switchOn flags.context
    \1 :  $.switchOn!
  longOptions:
    \all :                   $.sameAs \a
    \almost-all :            $.sameAs \A
    \escape :                $.sameAs \b
    \directory :             $.sameAs \d
    \classify :              $.sameAs \F
    \no-group :              $.sameAs \G
    \human-readable :        $.sameAs \h
    \inode :                 $.sameAs \i
    \kibibytes :             $.sameAs \k
    \dereference :           $.sameAs \l
    \numeric-uid-gid :       $.sameAs \n
    \literal :               $.sameAs \N
    \indicator-style=slash : $.sameAs \p
    \hide-control-chars :    $.sameAs \q
    \quote-name :            $.sameAs \Q
    \reverse :               $.sameAs \r
    \recursive :             $.sameAs \R
    \size :                  $.sameAs \S
    \context :               $.sameAs \Z

$.generate(optionsParser)

  

defaultComponentData = ->
  exec:"ls",
  flags:{-"reverse",-"do not list owner",-"do not list group",-"numeric ID",-"inode",-"human readable"}
  selectors:
    "indicator style": indicatorStyleSelector.none
    "time style":      timeStyleSelector.locale
    "quoting style":   quotingStyleSelector.literal
    "format":          formatSelector.default
    "sort"  :          sortSelector.name
    "show"  :          showSelector.default
  parameters:
    "ignore" : ""
  files:[]

exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData)
exports.parseComponent = $.commonParseComponent(flagOptions,selectorOptions)
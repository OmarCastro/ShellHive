
/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
function get-CSS-supported-prop(proparray)
    root=document.documentElement
    for i in proparray
        if i of root.style
            return i 

cssTransform = get-CSS-supported-prop <[transform WebkitTransform MsTransform]>


listOfImplementedCommands = [
    \awk
    'cat'
    'grep'
    'bunzip2'
    'bzcat'
    'bzip2'
    'compress'
    'ls'
    \gzip
    \gunzip
    \zcat
]

function isImplemented(data)
  return listOfImplementedCommands.indexOf data.exec >= 0



function closestParentWithClass(element,classStr)
  parent = element.parentElement
  while parent != document.body
    if angular.element(parent).hasClass(classStr)
      return parent
    else
      parent = parent.parentElement
  return null


SelectionOptions = shellParser.VisualSelectorOptions
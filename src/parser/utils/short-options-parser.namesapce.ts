
import { Iterator } from "./iterator.class"


export function parseShortOptions(options,componentData,argsNodeIterator){
  var option,
      shortOptions = options.shortOptions,
      iter = new Iterator(argsNodeIterator.current.slice(1))
  while(option = iter.next()){
    var arg = shortOptions[option]
    if(arg && arg(componentData,argsNodeIterator,iter)){ break }
  }
}

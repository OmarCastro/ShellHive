
import { Iterator } from "../utils/iterator.class"


export function parseShortOptions(options,componentData,argsNodeIterator){
  const shortOptions = options.shortOptions;
  const iter = new Iterator(argsNodeIterator.current.slice(1))
  while(iter.hasNext()){
    let option = iter.next()
    let arg = shortOptions[option]
    if(arg && arg(componentData,argsNodeIterator,iter)){ break }
  }
}

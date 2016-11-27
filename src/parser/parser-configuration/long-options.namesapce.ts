
import { Iterator } from "../utils/iterator.class"
import { optionsConfig } from "./interfaces"
import { CommandComponent } from "../../graph/component/command-component.class"


export function parseLongOptions(options: optionsConfig,componentData: CommandComponent,argsNodeIterator){
  const longOptions = options.longOptions;
  const optionStr = argsNodeIterator.current.slice(2);
  const indexOfSep = optionStr.indexOf('=');
  if (indexOfSep > -1) {
    const iter = new Iterator(optionStr);
    iter.index = indexOfSep + 1;
    const optionKey = optionStr.slice(0, indexOfSep);
    const arg = longOptions[optionKey] || longOptions[optionStr];
    if (arg) {
      return arg(componentData, argsNodeIterator, iter);
    }
  } else {
    const arg = longOptions[optionStr];
    if (arg) {
      return arg(componentData, null, null);
    }
  }
}
import { CommandComponent } from "../../graph/component/command-component.class"
import { ParseFunction } from "./optionsParser"
import { FlagInfo } from "./interfaces"

  /**
    activates flags (flags)
  */
export function activateFlags(...flags:(FlagInfo| string)[]): ParseFunction{
    const flagNames = flags.map((flag:any) => (flag.name) ? flag.name : flag);
    return function(component: CommandComponent, state, substate){
      flagNames.forEach(flagName => component.flags[flagName] = true);
      return false;
    };
  };
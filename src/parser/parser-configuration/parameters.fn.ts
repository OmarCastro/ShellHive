import { ParameterInfo } from "./interfaces"
import { CommandComponent } from "../../graph/component/command-component.class"
import { ParseFunction } from "./optionsParser"

export interface ParameterFn extends ParseFunction{
  ptype: string
  param: string
}

export function setParameter(param: ParameterInfo): ParseFunction{
  const paramFn = <ParameterFn><ParseFunction> function(Component: CommandComponent, state, substate){
    const parameter = substate.hasNext() ? substate.rest() : state.next();
    Component.parameters[param.name] = parameter;
    return true;
  };
  paramFn.ptype = 'param';
  paramFn.param = param.name;
  return paramFn
};

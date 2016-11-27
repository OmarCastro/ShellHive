import { ICommandParser, ITeeCommandParser } from "./_command-parser.class";

interface parserCommandList {
    [s: string]: ICommandParser | ITeeCommandParser;
}

import {commandParser as awk} from "./awk"
import * as cat from "./cat"
import * as curl from "./curl"
import * as date from "./date"
import * as diff from "./diff"
import * as echo from "./echo"
import * as bunzip2 from "./bunzip2"
import * as bzcat from "./bzcat"
import * as bzip2 from "./bzip2"
import * as grep from "./grep"
import * as ls from "./ls"
import * as compress from "./compress"
import * as sort from "./sort"
import * as gzip from "./gzip"
import * as gunzip from "./gunzip"
import * as zcat from "./zcat"
import * as head from "./head"
import * as tail from "./tail"
import * as tr from "./tr"
import * as tee from "./tee"
import * as uniq from "./uniq"
import * as wc from "./wc"

export const parserCommand: parserCommandList = {
  awk,cat,curl,date,diff,echo,bunzip2,bzcat,bzip2,grep,ls,compress,sort,gzip,gunzip,zcat,head,tail,tr,tee,uniq,wc
};

export const visualSelectorOptions = Object
    .keys(parserCommand)
    .map((commandName) => {return {key:commandName, value: parserCommand[commandName].visualSelectorOptions}})
    .filter(command => command.value != null)
    .reduce((obj, command) => {obj[command.key] = command.value; return obj}, {})
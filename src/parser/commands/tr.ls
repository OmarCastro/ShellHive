/*  -c, -C, --complement usa o complemento de SET1
  -d, --delete apaga caracteres em SET1, não traduz
  -s, --squeeze-repeats substitui cada sequência de entrada de um caractere repetido
                            que esteja listado em SET1 com uma única ocorrência
                            deste caractere
  -t, --truncate-set1 primeiro truncar SET1 para tamanho do SET2
      --help     exibir esta ajuda e sair
      --version  mostrar a informação de versão e sair

SETs são especificados como cadeias de caracteres. A maioria
auro-representa-se. Sequências interpretadas são:

  \NNN            carácter com valor octal NNN (1 a 3 dígitos octais)
  \\              backslash (barra invertida)
  \a              BEL audível
  \b              backspace (espaço atrás)
  \f              form feed
  \n              nova linha
  \r              return (enter)
  \t              tab horizontal
  \v              tab vertical
  CAR1-CAR2       todos os caracteres de CAR1 a CAR2 por ordem crescente
  [CAR*]          em SET2, cópias de CAR até tamanho de SET1
  [CAR*REP]       REP cópias de CAR, REP octal se começar por 0
  [:alnum:]       todas as letras e dígitos
  [:alpha:]       todas as letras                                                                                                                                                               
  [:blank:]       todos os espaços brancos horizontais                                                                                                                                          
  [:cntrl:]       todos os caracteres de controlo                                                                                                                                               
  [:digit:]       todos os dígitos                                                                                                                                                              
  [:graph:]       todos os caracteres mostráveis, excluindo space (espaço)                                                                                                                      
  [:lower:]       todas as letras minúsculas                                                                                                                                                    
  [:print:]       todos os caracteres mostráveis, incluindo space (espaço)                                                                                                                      
  [:punct:]       todos os caracteres de pontuação                                                                                                                                              
  [:space:]       todos os espaços brancos horizontais e verticais                                                                                                                              
  [:upper:]       todas as letras maiúsculas                                                                                                                                                    
  [:xdigit:]      todos os dígitos hexadecimais                                                                                                                                                 
  [=CAR=]         todos os caracteres equivalentes a CAR  
*/

$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");

flags = {
  \complement
  \delete
  squeeze: "squeeze repeats"
  truncate: "truncate set1"
}

const selectorOptions = {}
exports.VisualSelectorOptions = {}

const flagOptions =
  \complement : \c
  \delete : \d
  "squeeze repeats" : \s
  "truncate set1" : \t


optionsParser = 
  shortOptions:
    c  :  $.switchOn flags.complement
    C  :  $.switchOn flags.complement
    d  :  $.switchOn flags.delete
    s  :  $.switchOn flags.squeeze
    t  :  $.switchOn flags.truncate
  longOptions:
    \complement :      $.sameAs \c
    \delete :          $.sameAs \d
    \squeeze-repeats : $.sameAs \s
    \truncate-set1 :   $.sameAs \t


$.generate(optionsParser)


defaultComponentData = ->
  type:\command
  exec: \tr,
  flags:{-"complement",-"delete",-"squeeze repeats",-"truncate set1"}
  set1: ""
  set2: ""


exports.parseCommand   = common.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) !-> 
        if set1 == "" then set1 = str else set2 = str
    })

exports.parseComponent = common.commonParseComponent flagOptions,selectorOptions, null, (component,exec,flags,files) ->
  {set1,set2} = component
  (exec ++ flags ++ set1 ++ set2) * ' '
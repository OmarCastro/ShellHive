/*
sed [-n] script[file...]

sed [-n][-e script]...[-f script_file]...[file...]

DESCRIPTION

The sed utility is a stream editor that shall read one or more text files, make editing changes according to a script of editing commands, and write the results to standard output. The script shall be obtained from either the script operand string or a combination of the option-arguments from the -e script and -f script_file options.

OPTIONS

The sed utility shall conform to the Base Definitions volume of IEEE Std 1003.1-2001, Section 12.2, Utility Syntax Guidelines, except that the order of presentation of the -e and -f options is significant.

The following options shall be supported:

-e  script
      Add the editing commands specified by the script option-argument to the end of the script of editing commands. The script option-argument shall have the same properties as the script operand, described in the OPERANDS section.
-f  script_file
      Add the editing commands in the file script_file to the end of the script.
-n
      Suppress the default output (in which each line, after it is examined for editing, is written to standard output). Only lines explicitly selected for output are written.
      Multiple -e and -f options may be specified. All commands shall be added to the script in the order specified, regardless of their origin.

Se não forem dadas as opções -e, --expression, -f ou --file, então, o primeiro
argumento não-opção é considerado como o 'script' a interpretar. Todos os
restantes argumentos só nomes de ficheiros de entrada; se não forem especificados
ficheiros de entrada, então, a entrada padrão (standard input) é lida.  
*/


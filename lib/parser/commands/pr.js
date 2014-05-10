/*

Utilização: pr [OPÇÃO]... [FICHEIRO]...
Paginar ou colunizar FICHEIRO(s) para impressão.

Argumentos mandatórios para opções longas são mandatórios para opções curtas também.
  +PRIMEIRA_PÁGINA[:ÚLTIMA_PÁGINA], --pages=PRIMEIRA_PÁGINA[:ÚLTIMA_PÁGINA]
                    inicia [para] impressão com a página PRIMEIRA_[ÚLTIMA_]PÁGINA
  -COLUNA, --columns=COLUNA
                    retorna as colunas COLUNA e imprime as colunas abaixo delas,
                    a não ser que -a seja usado.Balanceia o número de linhas nas
                    colunas em cada página
  -a, --across      imprimir colunas em largura, não altura, usado em conjunto
                    com -COLUNAS
  -c, --show-control-chars
                    usar notações de chapéu (^G) e barra invertida octal
  -d, --double-space
                    duplicar o espaço da saída
  -D, --date-format=FORMATO
                    usar FORMATO para a data de cabeçalho
  -e[CAR[LARGURA]], --expand-tabs[=CAR[LARGURA]]
                    expandir CARacteres de entrada (TABs) para LARGURA (8)
  -F, -f, --form-feed
                    usar form feeds em vez de nova linha para separar páginas
                    (por um cabeçalho de página de 3 linhas com -F ou
                    cabeçalho e reboque de 5 linhas sem -F)
  -h, --header=CABEÇALHO
                    usar um CABEÇALHO centrado em vez do nome de ficheiro no cabeçalho da página,
                    -h "" imprime uma linha em branco, não utilizar -h""
  -i[CHAR[LARGURA]], --output-tabs[=CHAR[LARGURA]]
                    substituir espaços com CHARs (TABs) na LARGURA (8) de tabs
  -J, --join-lines  fundir linhas completas, desligar a truncagem de linha -W line truncation, sem alinhamento
                    de coluna, --sep-string[=STRING] define os separadores
  -l, --length=COMPRIMENTO_DE_PÁGINA
                    define o comprimento de página para COMPRIMENTO_DE_PÁGINA (66) linhas
                    (número padrão de linhas de texto 56, e com -F 63)
  -m, --merge       imprimir todos os ficheiros em paralelo, um em cada coluna,
                    truncar linhas, mas juntar linhas de comprimento total com -J
  -n[SEP[DIGITS]], --number-lines[=SEP[DIGITS]]
                    número de linhas, usa DIGITS (5) dígitos, 
                    depois SEP (TAB), a contagem pré-definida começa 
                    na 1a linha do ficheiro de entrada
  -N, --first-line-number=NÚMERO
                    começar a contar no NÚMERO desde a 1.ª linha
                    da página imprimida (consulte +PRIMEIRA_PÁGINA)
  -o, --indent=MARGEM
                    compensar cada linha com zero espaços de MARGEM, não
                    afecta -w ou -W, MARGEM será adicionada à LARGURA_DE_PÁGINA
  -r, --no-file-warnings
                    omitir avisos quando um ficheiro não pode ser aberto
  -s[CARACTER], --separator[=CARACTER]
                    separa colunas por um único caracter, o padrão para CARACTER
                    é o caracter <TAB> sem -w e 'no char' com -w
                    -s[CARACTER] desliga os truncamentos de linha de todas as 3 opções
                    de coluna (-COLUNA|-a -COLUNA|-m) exceto se -w for definido
  -S[STRING], --sep-string[=STRING]
                    separate columns by STRING,
                    without -S: Default separator <TAB> with -J and <space>
                    otherwise (same as -S" "), no effect on column options
  -t, --omit-header  omit page headers and trailers
  -T, --omit-pagination
                    omitir cabeçalhos e marcas de paginação, eliminar qualquer 
                    paginação por marca de nova-página no ficheiro de entrada
  -v, --show-nonprinting
                    usar notação octal de barra invertida
  -w, --width=LARGURA_DA_PÁGINA
                    definir a largura da página em LARGURA_DA_PÁGINA (72)
                    número de caracteres apenas para o formato de múltiplas 
                    colunas de texto, o -s[carácter] desliga (72)
  -W, --page-width=LARGURA_DA_PÁGINA
                    definir a largura da página em LARGURA_DA_PÁGINA (72) 
                    número de caracteres sempre, trunca as linhas, excepto se 
                    a opção -J for definida, não interfere com -S ou -s
      --help     exibir esta ajuda e sair
      --version  mostrar a informação de versão e sair
*/

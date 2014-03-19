/*
  -b, --ignore-leading-blanks  ignorar espaços iniciais
  -d, --dictionary-order      considerar apenas espaços e car. alfanuméricos
  -f, --ignore-case           ignorar capitalização de letras
  -g, --general-numeric-sort  compare according to general numerical value
  -i, --ignore-nonprinting    consider only printable characters
  -M, --month-sort            compare (unknown) < 'JAN' < ... < 'DEC'
  -h, --human-numeric-sort compara números humanamente legíveis (ex: 2K 1G)
  -n, --numeric-sort          comparar de acordo com o valor numérico da expressão
  -R, --random-sort           ordenar por "hash" aleatório de chaves
      --random-source=FICHEIRO    obter bytes aleatórios de um FICHEIRO
  -r, --reverse               inverter o resultado das comparações
      --sort=PALAVRA ordenar de acordo com PALAVRA:
                                general-numeric -g, human-numeric -h, mês -M,
                                numérico -n, aleatório -R, versão -V
  -V, --version-sort ordenação natural dos números (de versão) dentro do texto


      --batch-size=NMERGE   fundir pelo menos NMERGE entradas de uma só vez;
                            para mais, usar ficheiros temporários
  -c, --check, --check=diagnose-first  verifica por entrada ordenada; não ordena
  -C, --check=quiet, --check=silent  semelhante a -c, mas não relata a primeira linha inválida
      --compress-program=PROG  comprime temporários com PROG;
                              descomprime-os com PROG -d
      --debug               anota a parte da linha usada para ordenação,
                              e avisa sobre uso questionável de stderr
      --files0-from=F       lê entrada a partir dos arquivos especificados por
                            nomes no arquivo F terminados com NUL;
                            Se F for - então lê nomes a partir da entrada padrão
  -k, --key=KEYDEF          sort via a key; KEYDEF gives location and type
  -m, --merge               merge already sorted files; do not sort
  -o, --output=FICHEIRO     resultado no FICHEIRO em vez da saída padrão
  -s, --stable              estabilizar desactivando comparações de recurso
  -S, --buffer-size=TAMANHO usar TAMANHO para memória principal temporária
  -t, --field-separator=SEP  usar SEP ao invés da transição de não-vazios para vazios
  -T, --temporary-directory=DIR  usar DIR para arquivos temporários, não $TMPDIR ou /tmp;
                              múltiplas opções especificam múltiplos diretórios
      --parallel=N          altera o número de tipos executados simultaneamente a N
  -u, --unique              com -c, verifica por ordenação estrita;
                              sem -c, exibe apenas a primeira de uma execução igual
  -z, --zero-terminated     terminar linhas com byte 0, não nova linha

*/
(function(){

}).call(this);

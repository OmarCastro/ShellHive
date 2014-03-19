all:
	cat AST-parser-init.ls commands/*.ls AST-parser.ls > fullparser.ls
	../node_modules/.bin/lsc -c fullparser.ls

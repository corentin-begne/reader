concatScript = ./tomainconfrequire.js
tempAllConf = /tmp/all.confrequire.js
baseUrl = .

conf = ./confrequire.js 
name = ./main.confrequire.js
out_prod = ./main.min.js

compile:
	node $(concatScript) $(conf) > $(tempAllConf)
	r.js -o name=$(name) out=$(out_prod) mainConfigFile=$(tempAllConf) baseUrl=$(baseUrl) optimize=uglify
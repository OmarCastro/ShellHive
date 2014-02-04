results = document.querySelector \div.content


socket = io.connect!

socket.emit \helper ""

socket.on \stdout (data)!->
	#elem = results.querySelector "[data-commandline=\"#{data.commandline}\"]"
	#if not elem
	elem = document.createElement('div')
		..setAttribute \data-commandline data.commandline
	elem.innerHTML = """<div class="commandline"><span>#{data.commandline}</span></div>
					 <pre>#{data.content} </pre>"""
	results.appendChild(elem)

socket.on \error (data)!->
	elem = document.createElement('div')
		..innerHTML = "command line : #{data.commandline}\nresult: #{data.content}"
	results.appendChild(elem)
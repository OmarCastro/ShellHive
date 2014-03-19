require! {express, jade, fs, util, stylus, nib, Datastore: nedb, \child_process .spawn}




/**
 defines a unix commands
*//*
class CommandProcess
	(exec, args, nodeId) ->
		@exec = exec
		@args = args
		@has-pipe = no
		@isClosed = yes
		@next-process = null
		@captureStdout = no
		@node-id = nodeId
		@line-command = ''
	commandString: -> 
		args = []
		for x in @args
			if x.indexOf(' ') is -1
				args.push x
			else
				args.push "\"#x\""
		"#{@exec} #{args * ' '}"
	onErrData: (data) !-> @errdata += data
	onOutData: (data)!-> 
		@outdata += data.toString('utf8')
		nextProc = @next-process
		if nextProc
			nextProc.spawn.stdin.write data unless nextProc.isClosed
	onSpawnClosed: (code)!-> 
		console.log 'the process', @commandString!, ' closed'
		unless code is 0
			io.sockets.in \helpers .emit \error {id: @node-id, commandline: @line-command, content: @errdata}
		if @captureStdout
			io.sockets.in \helpers .emit \stdout {id: @node-id, commandline: @line-command, content: @outdata}
		nextProc = @next-process
		if nextProc
			nextProc.spawn.stdin.end! unless nextProc.isClosed
		@isClosed = yes


	run: ->
		@isClosed = no
		@errdata = ""
		@outdata = ""
		pr = @
		@spawn = spawn @exec, @args
			..stdout.on \data, -> pr.onOutData(it)
			..stderr.on \data, -> pr.onErrData(it)
			..on \close, -> pr.onSpawnClosed(it)


/**
defines a complete unix command line


*//*
class CommandLine
	(exec, args, nodeId) ->
		new-process = new CommandProcess(exec, args, nodeId)
			..captureStdout = yes
			..line-command = new-process.commandString!
		@processes = [new-process]


	cdpipe: (exec, args, nodeId)->
		lastprocess = @processes[@processes.length-1]
		new-process = new CommandProcess(exec, args, nodeId)
			..captureStdout = yes
			..line-command = "#{lastprocess.commandString!} | #{new-process.commandString!}"

		@processes.push new-process
		lastprocess.next-process = new-process

		this
	run: ->
		for x in @processes
			x.run!
	captureProcess: (num)!->
		@processes[num].captureStdout = yes
	commandString: -> [x.commandString! for x in @processes]*' | '


# */




app = express!
db = new Datastore {filename: 'db/basic.db', autoload: true}
db.ensureIndex({ fieldName: 'name', unique: true })
db.persistence.setAutocompactionInterval 5000

io = app.listen 8000 |> require \socket.io .listen
	


app.set \views , __dirname + \/views
app.set 'view engine' , \jade
app.set 'view options' , { layout: false }
app.configure !->
	app.use(stylus.middleware(
		src: __dirname + '/views',   #.styl files are located in `views/stylesheets`
		dest: __dirname + '/public', # .styl resources are compiled `/stylesheets/*.css`
		compile: (str, path, fn) -> # optional, but recommended
			stylus(str) 
				.set 'filename', path 
				.set 'compress', true
				.use nib!
	))
	__dirname + '/public' |> express.static |> app.use
	__dirname + '/bower_components' |> express.static |> app.use

app.get \/, (req, res) !-> res.render('home.jade')
app.get \/helper, (req, res) !-> res.render('helper.jade')



#for now we're testing with one workflow

io.sockets.on \connection (socket)!->

	/*
		new user entry event
	*/
	socket.on \graph-user (data) !-> 
		console.log "new user!!"
		socket.join \graph-users
		#TODO: fix for multiple projects
		db.find {name:'testWorkflow'}, (err,docs) !->
			console.log util.inspect(docs)
			if docs.length > 0
				socket.emit \flowData docs[0]
				console.log "sent ${docs[0]}"


	socket.on \helper (data) !-> 
		socket.join \helpers



	socket.on \run-app (data) !->
		/*
		line = new CommandLine(\cat,["nodes.txt"]).pipe("grep",["cat"])
			..captureProcess 0
			..run!
		*/

	socket.on \nodePosChanged (data) !->
		db.update({name:'testWorkflow'},{$set:{
			"nodes.#{data.id}.x":data.x,
			"nodes.#{data.id}.y":data.y}},{})
		socket.broadcast.to \graph-users .emit \nodePosChanged, data


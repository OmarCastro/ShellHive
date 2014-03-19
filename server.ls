require! {express, jade, fs, util, stylus, nib, Datastore: nedb, \child_process .spawn}
commandRunner = require './server/commandRunner'
parser = require './target/parser/parser'

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

	socket.on \runCommand (socketData) !->
		try
			command = parser.parseVisualData(socketData.visualData)
			socket.emit("commandCall", command)
			commandRunner.run(command)
				..onStdOut = (data) !-> socket.emit("stdout", data.toString('utf8'))
				..onStdErr = (data) !-> socket.emit("stderr", data.toString('utf8'))
				..onExit = (code) !-> socket.emit("commExit", code)
		catch e
			socket.emit("stderr", "error parsing the graph #e")


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


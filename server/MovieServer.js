let net = require('net');
const uuidV4 = require('uuid/v4');
const path = require('path');
const fs = require('fs');
const settings = require('./settings.json')
const moviesPath = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], 'Downloads', 'movies');

class MovieServer {

	constructor(){
		this.movieGrabPort = settings.port;
		this.filePort = 4444;
		this.members = settings.members;
		this.clients = [];
		this.getMovies((err, movies, movieList)=>{
			this.movies = movies;
			this.movieList = movieList;
		});
		
	}

	startServer(){
		
			net.createServer((socket)=>{
				socket.id = uuidV4();
				socket.name = socket.remoteAddress + ":" + socket.remotePort;
				this.clients.push(socket);
				socket.write("Welcome " + socket.name + "\n");
				this.broadcast(socket.name + " joined the chat\n", socket);

				socket.on('data', (data)=>{
					this.execute(data.toString().trim() , (err,res)=>{
						if(res){
							this.broadcast(res.toString().trim(), socket);
						}

					});
				});

				socket.on('close', (data)=>{
					console.log('socket close');
				});

				socket.on("error", (err) =>{
				    console.log("Caught flash policy server socket error: ");
				    this.clients.map(sock=>{
				    	if(sock.id == socket.id)
				    		console.log('Found socket and remove!');
				    });
				    socket.destroy();
				});

				this.clients.map(sock=>console.log('client:'+ sock.remoteAddress));

			}).listen(this.movieGrabPort)
			.on("error", (err) =>{
			    console.log("Movie server error. ");
			    console.log(err.stack);
			});

		

		console.log('server on!');

		
	}

	broadcast(message, sender){
		this.clients.forEach( client=>{
		// if(client == sender) return;

		client.write(message + '\n');
		});

		process.stdout.write(message + '\n');
	}

	getMovies(cb){
		if(!cb) return;

		fs.readdir(moviesPath, (err, files)=>{
			if(err) 
				return cb('error');

			var movieList = '';
			var count = 1;

			files.map(file=>{
				movieList += count+'. '+file+'\n';
				if(count == files.length){
					return cb('success' , movieList, files);
				}
				count++;
			});
			
		});
	}

	execute(cmd, cb){
		let cmdArr = cmd.split(' ');
		switch(cmdArr[0]){
			case 'show':
				cb('success',this.movies);
				break;
			case 'grab':
				let fileName = this.movieList[Number(cmdArr[1])-1];
				let fileSize = fs.statSync(path.join(moviesPath, fileName)).size;

				if(!fileName)
					return cb('error', 'no such movie');
				else{
					this.startFileServer(fileName);
					return cb('success', 'getFilexssuiox' + fileName + 'xssuiox' + fileSize + 'xssuiox' + this.filePort);
				}
			default:
				break;
		}
	}

	startFileServer(fileName){
		let fileServer = net.createServer((socket)=>{
			console.log('File server connected.');

			socket.on('close', (data)=>{
				fileServer.close();
			});

			let sourceFile = path.join(moviesPath, fileName);
			let rs = fs.createReadStream(sourceFile);
			rs.on('open', function() {
			    rs.pipe(socket);
		  	});

		}).listen(this.filePort)
		.on('error', (err)=>{
			console.log('File server ERROR!!!!!!!!!!!!!');
			console.log(err);
		});;
	}

}

module.exports={
	MovieServer:MovieServer
}
let net = require('net');
const path = require('path');
const fs = require('fs');
const settings = require('./settings.json')
const moviesPath = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], 'Downloads', 'movies');

class MovieServer {
	constructor(){
		this.port = settings.port;
		this.members = settings.members;
		this.clients = [];
		this.getMovies((err, movies, movieList)=>{
			this.movies = movies;
			this.movieList = movieList;
		});
		
	}

	createServer(){
		net.createServer((socket)=>{
			socket.name = socket.remoteAddress + ":" + socket.remotePort;
			this.clients.push(socket);
			socket.write("Welcome " + socket.name + "\n");
			this.broadcast(socket.name + " joined the chat\n", socket);

			socket.on('data', (data)=>{
				this.execute(data.toString().trim(), (err,res)=>{
					if(res){
						this.broadcast(res.toString().trim(), socket);
					}
				});
			});

			this.clients.map(sock=>console.log('client:'+sock.name));

			// socket.end('end', ()=>{
			// 	this.clients.splice(this.clientsclients.indexOf(socket), 1);
			// 	this.broadcast(socket.name + "left the chat.\n");
			// });
		}).listen(this.port);

		console.log('server on!');
	}

	broadcast(message, sender){
		this.clients.forEach( client=>{
		// if(client == sender) return;

		client.write(message);
		});

		process.stdout.write(message)
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
				let fileName = this.movieList[cmdArr[1]];
				if(!fileName)
					return cb('error', 'no such movie');
				else{
					return cb('success', 'fileNamexssuiox' + fileName);
				}
			default:
				break;
		}
	}

}

module.exports={
	MovieServer:MovieServer
}
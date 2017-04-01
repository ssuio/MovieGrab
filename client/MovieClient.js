let net = require('net');
let fs = require('fs');
let stdin = process.openStdin();
let path = require('path');

class MovieClient{
	constructor(){
		this.client = new net.Socket();
		this.status = '';
		this.downloadPath = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], 'Downloads');
		
	}

	connect(){
		this.client.connect('3333', '127.0.0.1', ()=>{
			let msg = '';
			console.log('Connected');
			
			stdin.addListener("data", (msg)=>{
				this.client.write(msg.toString().trim());

			});

		})

		this.client.on('data', (data)=>{
			let msg = data.toString().trim();
			let msgArr = msg.split('xssuiox');
			switch(msgArr[0]){
				case 'fileName':
					let fileName = msgArr[1];
					this.download(msgArr[1], data , ()=>{

					});
					break;
				default:
					console.log(msg);
					break;
			}
		})
	}

	download(fileName, data, cb){
		let stream = fs.createWriteStream(path.join(this.downloadPath ,fileName));

		this.client.pipe(stream).on('finish', () => {
		    console.log("Write successful");
		    console.log("Press Ctr+c to exit");
		  })
		// let dowloadPath = path.join(this.dowloadPath, fileName);
		console.log(`${fileName} is downloading...`);
	}
}

module.exports = {
	MovieClient:MovieClient
}
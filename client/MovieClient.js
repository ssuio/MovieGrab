let net = require('net');
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
			console.log(msgArr);
			switch(msgArr[0]){
				case 'fileName':
					this.download(msgArr[1]);
					break;
				default:
					console.log(msg);
					break;
			}
		})
	}

	download(fileName){
		// let dowloadPath = path.join(this.dowloadPath, fileName);
		console.log(`${fileName} is downloading...`);
	}
}

module.exports = {
	MovieClient:MovieClient
}
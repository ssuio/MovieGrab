let net = require('net');
let fs = require('fs');
let stdin = process.openStdin();
let path = require('path');
const domain = '127.0.0.1';
// const domain = 'ssuio.idv.tw';

class MovieClient{
	constructor(){
		this.client = new net.Socket();
		this.status = '';
		this.downloadPath = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], 'Downloads');
		
	}

	connect(){
		this.client.connect('3333', domain, ()=>{
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
				case 'getFile':
					let fileName = msgArr[1];
					let fileSize = msgArr[2];
					let fileSockPort = msgArr[3];
					this.download(fileName , fileSize, fileSockPort , ()=>{});
					break;
				default:
					console.log(msg);
					break;
			}
		})
	}

	download(fileName, fileSize, port , cb){
		let fileClient = new net.Socket();
		let offset = 0;
		let percentage = 0;

		try{
			fileClient.connect( port , domain, ()=>{
				let stream = fs.createWriteStream(path.join(this.downloadPath ,fileName));
				fileClient.pipe(stream).on('finish', () => {
				    console.log("Write successful");
				    fileClient.destroy();
				  })
			});

			fileClient.on('data', (data)=>{
				let newPercentage = Math.floor((offset/fileSize) * 100);
				offset += data.length;
				if(newPercentage > percentage){
					percentage = newPercentage;
					console.log('progress....' + newPercentage + '%' );
				}
			});

			fileClient.on('close', function() {
			    console.log('Connection closed');
			});	

			fileClient.on('error', ()=>{
				console.log('ERRRRRR');
			});
		}catch(e){
			console.log(e);
		}
		console.log(`${fileName} is downloading...`);
	}
}

module.exports = {
	MovieClient:MovieClient
}
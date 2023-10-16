// preload.js
	const { app, BrowserWindow ,Menu   } = require('electron');
	const { contextBridge, ipcRenderer ,shell } = require('electron');
	const path = require('path');
	const { exec } = require('child_process');

	const API = {};
	const EVENT = {};

   let enlarged = false;
   
	contextBridge.exposeInMainWorld('ipcRenderer', {
		on: ipcRenderer.on,
		send: ipcRenderer.send,
	});


	EVENT.infoPkg = function(callback){
		ipcRenderer.on('service-status', (evnt, message) => {
			//let pkgObj = require(path.join(__dirname, 'package.json'));
			callback(evnt, message);
			//console.log(message); // logs out "Hello second window!"
		})
	};
	
	EVENT.openRecents = function(callback){
		ipcRenderer.on('service-status', (evnt, message) => {
			//let pkgObj = require(path.join(__dirname, 'package.json'));
			callback(evnt, message);
			//console.log(message); // logs out "Hello second window!"
		})
	};

	API.on = function(eventType, callback){
	   EVENT[eventType](callback);
	};
	
	
	API.send = function(eventType, data){
	   //console.log(data);	 
		//if eventType open-explorer
		
      if (eventType == "open-explorer"){
		 shell.showItemInFolder(data)	   
	  }
	  else  if (eventType == "save-explorer"){
		 const pythonProcess = exec('python windows-path.py', (error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error}`);
			return;
		}
			alert("Successfully saved !");
			console.log(`Python script output: ${stdout}`);
		});   
	  } 
	  else if (eventType == "resize-window"){
		    enlarged = !enlarged;
		    ipcRenderer.send('resize-window',enlarged);
	  }
	  else if (eventType == "open-chat"){
		  
		 shell.openExternal('https://chat.openai.com/');
	    //const newWindow = new BrowserWindow({ width: 800, height: 600 });
        //newWindow.loadURL('https://chat.openai.com/'); 	    
	  }
	  
	};

	// create an api for window objects in web pages
	contextBridge.exposeInMainWorld('API', API);
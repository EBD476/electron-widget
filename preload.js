// preload.js
	const { app, BrowserWindow ,Menu   } = require('electron');
	const { contextBridge, ipcRenderer ,shell } = require('electron');
	const path = require('path');
	const { exec } = require('child_process');
	const fs = require('fs');
	const Client = require('ssh2').Client;
	
	const API = {};
	const EVENT = {};
	const serviceNames = {};
	
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
	/*
	//EVENT.serviceNames = function(callback){
		ipcRenderer.on('service-names', (evnt, message) => {
			
			// Read the configuration file
			const configPath = path.join(__dirname, 'config.json');
			const configData = fs.readFileSync(configPath, 'utf-8');
			const config = JSON.parse(configData);
			
		  //	console.log(getServiceStatus(config.services));
			
			
			const serviceList = document.getElementById('service-status-container');
			//console.log(serviceStatuses);
			  serviceStatuses.forEach((service) => {
				  
				const serviceStatus = serviceStatuses[service];
			    const statusDiv = document.createElement('div');
				statusDiv.classList.add('service'); 
				const serviceTitle = document.createElement('span');
				const serviceStatusSpan = document.createElement('span');
				statusDiv.appendChild(serviceTitle);
				statusDiv.appendChild(serviceStatusSpan);
				serviceTitle.textContent = `${serviceStatus}`;
				//const listItem = document.createElement('span')
				//listItem.textContent = service;
				serviceList.appendChild(statusDiv)				  
			  });
			
			//callback(evnt, message);
			
		})
	//};
	*/
	
	EVENT.openFile = function(callback){		
		ipcRenderer.on('open-file', (evnt, message) => {
			
			const filePath = 'explorer_paths.txt'
			   // Read the contents of the selected file
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error(err);
                        return;
                    }					
                    const textList = document.getElementById('text-list');
					textList.innerHTML  = null;
                    const lines = data.split('\n');					

                    // Populate the list view with file contents
                    lines.forEach((line) => {
                        const listItem = document.createElement('li');
                        listItem.textContent = line;
                        textList.appendChild(listItem);
                    });
                });
				
			callback(evnt, message);			
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
	  } else if (eventType == "tr-generate"){
		  
		const curlCommand = `curl http://172.16.67.140:5656/api/${data}`; 
		exec(curlCommand, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error.message}`);
				return;
			}
			console.log(`stdout: ${stdout}`);			
		});		  
	  }
	  
	};
	
 
	// create an api for window objects in web pages
	contextBridge.exposeInMainWorld('API', API);
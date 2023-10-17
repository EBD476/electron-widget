
const { app, BrowserWindow ,Menu , shell ,ipcMain  } = require('electron');
const { screen } = require('electron');
const Client = require('ssh2').Client;
const path = require('path');
const fs = require('fs');

//let mainWindow; // Declare mainWindow in the outer scope

const servicesToCheck = ['zoo.service', 'kafka.service'];

 const sshConfig = {
	host: '172.16.67.140',
	port: 22, 
	username: 'root',
	password: 'isc@123456789',
};

let originalSize = { width: 430, height: 140 };
let enlargedSize = { width: 430, height: 800 };



function retrieveServiceStatus(mainWindow) {

	const configPath = path.join(__dirname, 'config.json');
	const configData = fs.readFileSync(configPath, 'utf-8');
	const config = JSON.parse(configData);


	const sshClient = new Client();	
	sshClient.connect(sshConfig);

    sshClient.on('ready', () => {		
		
		// Prepare a command to list all service units
        const command = 'systemctl list-units --type=service --all';
		
        // SSH connection is ready; you can now execute commands
		//systemctl is-active zoo
        sshClient.exec(command, (err, stream) => {
		let count = 0;
            if (err) {
                console.error('SSH error:', err);
                mainWindow.webContents.send('service-status', 'SSH error');
            } else {
				const serviceStatuses = {};
                stream.on('data', (data) => {					
	
				    const outputLines = data.toString().split('\n');
				
					outputLines.forEach(line => {
						const parts = line.split(/\s+/);
						
						if (parts.length >= 3) {
							const serviceName = parts[1];						
							const serviceStatus = parts[3];
							
							//console.log(serviceName)
							// Check if the service name is in the list of services to check
							if (config.services.includes(serviceName)) {								
								serviceStatuses[serviceName] = serviceStatus;							   
								count++;
							}
						}
					});
				
                    //const serviceStatus = data.toString().trim();
                    //console.log('Service status:', serviceStatus);
					//	console.log(serviceStatuses)                    
					
                }).on('close', (code) => {												
					sshClient.end();																								
					mainWindow.setSize(originalSize.width, 130 + (count * 18))
					originalSize.height = 130 + (count * 18);
					mainWindow.webContents.send('service-status', serviceStatuses);					                    
                });
            }
        });			
    });
	
}

function createWindow() {
	
  const { width } = screen.getPrimaryDisplay().workAreaSize;	
	
  const mainWindow = new BrowserWindow({
    width: 430,
    height: 130,
	
	x: width-450, // Set the left (x) position to place it at the right edge
    y: 10,
	frame: false,
    webPreferences: {
      nodeIntegration: true,
	  preload: path.join(__dirname, 'preload.js'), 
    },
	 
	 alwaysOnTop: true,
	 skipTaskbar: true,
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile('index.html');
  


    // Send the service names to the renderer process
    //mainWindow.webContents.send('service-names','');
  
  
	// Retrieve and send service status when the app is ready
    retrieveServiceStatus(mainWindow);

    // Check service status at 1-minute intervals
    setInterval(() => {
        retrieveServiceStatus(mainWindow);
    }, 60000); // 60000 milliseconds = 1 minute
  
     // Handle the resize-window message from the preload script
    ipcMain.on('resize-window', (event, enlarge) => {
        const size = enlarge ? enlargedSize : originalSize;
        if (mainWindow) {
            mainWindow.setSize(size.width, size.height);			
			mainWindow.webContents.send('open-file', '')				
        }
    });
  
	// Add this code to open the DevTools inspector
	//mainWindow.webContents.openDevTools();

}

app.whenReady().then(() => {
	
  createWindow();
   
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  
});



app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
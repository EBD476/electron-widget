
const { app, BrowserWindow ,Menu , shell ,ipcMain  } = require('electron');
const { screen } = require('electron');
const Client = require('ssh2').Client;
const path = require('path');


//let mainWindow; // Declare mainWindow in the outer scope

const servicesToCheck = ['zoo.service', 'kafka.service'];

 const sshConfig = {
	host: '172.16.67.140',
	port: 22, 
	username: 'root',
	password: 'isc@123456789',
};

let originalSize = { width: 400, height: 160 };
let enlargedSize = { width: 400, height: 800 };

function retrieveServiceStatus(mainWindow) {

	const sshClient = new Client();
	
	sshClient.connect(sshConfig);

    sshClient.on('ready', () => {		
		
		// Prepare a command to list all service units
        const command = 'systemctl list-units --type=service --all';
		
        // SSH connection is ready; you can now execute commands
		//systemctl is-active zoo
        sshClient.exec(command, (err, stream) => {
			
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
							if (servicesToCheck.includes(serviceName)) {								
								serviceStatuses[serviceName] = serviceStatus;							   
							}
						}
					});
				
                    //const serviceStatus = data.toString().trim();
                    //console.log('Service status:', serviceStatus);
					//	console.log(serviceStatuses)                    
					
                }).on('close', (code) => {												
					sshClient.end();
					mainWindow.webContents.send('service-status', serviceStatuses);					                    
                });
            }
        });			
    });
	
}

function createWindow() {
	
  const { width } = screen.getPrimaryDisplay().workAreaSize;	
	
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 160,
	
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
  
    // Open file explorer at a specific path
    //const pathToOpen = 'd:\\project\\kavosh'; // Replace with the path you want to open
    //shell.showItemInFolder(pathToOpen)
	
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
        }
    });
  
	// Add this code to open the DevTools inspector
//	mainWindow.webContents.openDevTools();

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
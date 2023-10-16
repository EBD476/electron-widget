const ipc = require('electron').ipcRenderer;

ipc.on('message', (event, message) => {
    console.log(message); // logs out "Hello second window!"
})
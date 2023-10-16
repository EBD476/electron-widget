// renderer.js
// Function to update the title attribute with the current time
function updateElementTitle() {
    const timeElement = document.getElementById('timeElement');
    if (timeElement) {
        //const currentTime = new Date().toLocaleTimeString();
		const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
        const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits
        const seconds = now.getSeconds().toString().padStart(2, '0'); // Ensure two digits
        const currentTime = `${hours}:${minutes}:${seconds}`;		
        timeElement.textContent = `${currentTime}`;	
    }
}

// Update the title attribute every second (1000 milliseconds)
setInterval(updateElementTitle, 1000);

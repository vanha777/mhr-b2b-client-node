// index.js

// Import the express module
const express = require('express');
const runServices = require('./main.js');

// Create an instance of express
const app = express();

// Define a route handler for the root path
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/test', async (req, res) => {
    try {
        // Pass the required arguments to the runServices function
        await runServices(/* filePath, attachmentPath, privatePem, publicPem, ca, hpio */);
        res.send('Services executed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }

});

// Start the server on port 3000
app.listen(3030, () => {
    console.log('\x1b[36m%s\x1b[0m', 'StrongRoomAi MHR-mobule running on http://localhost:3030/');
});
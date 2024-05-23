// index.js

// Import the express module
const express = require('express');
const { runUploadDocument, runDoesPCEHRExist, runGainPCEHRAccess, runGetDocumentList } = require('./main.js');
const bodyParser = require('body-parser');
// Create an instance of express
const app = express();
app.use(bodyParser.json());
// Define a route handler for the root path
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/upload-document', async (req, res) => {
    try {
        // Pass the required arguments to the runServices function
        await runUploadDocument(/* filePath, attachmentPath, privatePem, publicPem, ca, hpio */);
        res.send('Services executed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/does-pcehr-exist', async (req, res) => {
    try {
        // console.log('this is request',req.body);
        // Pass the required arguments to the runServices function
        const { patient, organization } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        const result = await runDoesPCEHRExist(patient, organization);
        res.send(result);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/gain-pcehr-access', async (req, res) => {
    try {
        // console.log('this is request',req.body);
        // Pass the required arguments to the runServices function
        const { patient, organization, accessType, accessCode } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient) {
            return res.status(400).send('Patient Information Required');
        }
        if (!patient.ihi) {
            return res.status(400).send('IHI number required');
        }
        if (!/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        if (accessType === "AccessCode") {
            if (accessCode === "") {
                console.log("Access Code MUST be supplied.")
                res.status(400).send("Access Code MUST be supplied.")
            }
        }
        const result = await runGainPCEHRAccess(patient, organization, accessType, accessCode);
        res.send(result);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/get-document-list', async (req, res) => {
    try {
        // console.log('this is request',req.body);
        // Pass the required arguments to the runServices function
        const { patient, organization, adhoc_query_id, documentTypes, documentClass, status, timeFrom, timeTo } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        const result = await runGetDocumentList(patient, organization, adhoc_query_id, documentTypes, documentClass, status, timeFrom, timeTo);
        res.send(result);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Start the server on port 3000
app.listen(3030, () => {
    console.log('\x1b[36m%s\x1b[0m', 'StrongRoomAi MHR-mobule running on http://localhost:3030/');
});
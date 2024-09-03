// index.js

// Import the express module
const express = require('express');
const cors = require('cors');
const { runUploadDocument, runDoesPCEHRExist, runGainPCEHRAccess, runGetDocumentList, runGetDocument, runGetView, runRemoveDocument } = require('./main.js');
const bodyParser = require('body-parser');
// Create an instance of express
const app = express();
// Allow requests from localhost:3000
app.use(cors({
    origin: 'http://localhost:3030'
}));
app.use(bodyParser.json());
// Define a route handler for the root path
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.post('/upload-document', async (req, res) => {
    console.log("Client request ...",req.body);
    try {
        const { patient, supersede_document_id, template_id, organization,document } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        // Pass the required arguments to the runServices function
        const result = await runUploadDocument(patient, supersede_document_id, template_id, organization,document);
        if (result.errors) {
            console.error('An error occurred:', result);
            res.status(200).send(result);
        } else {
            res.send(result);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/remove-document', async (req, res) => {
    console.log("Client request ...",req.body);
    try {
        const { patient, remove_document_id, reasons, organization } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        // Pass the required arguments to the runServices function
        const result = await runRemoveDocument(patient, remove_document_id,reasons, organization);
        if (result.errors) {
            console.error('An error occurred:', result);
            res.status(200).send(result);
        } else {
            res.send(result);
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/does-pcehr-exist', async (req, res) => {
    console.log("Client request ...",req.body);
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
    console.log("Client request ...",req.body);
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
    console.log("Client request ...",req.body);
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

app.post('/get-document', async (req, res) => {
    console.log("Client request ...",req.body);
    try {
        // console.log('this is request',req.body);
        // Pass the required arguments to the runServices function
        const { patient, organization, document } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        const result = await runGetDocument(patient, organization, document);
        res.send(result);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Start the server on port 3000
app.post('/get-view', async (req, res) => {
    console.log("Client request ...",req.body);
    try {
        // console.log('this is request',req.body);
        // Pass the required arguments to the runServices function
        const { patient, organization, viewOptions } = req.body;
        // Check if patient.ihi exists and has a length of exactly 16 digits
        if (!patient || !patient.ihi || !/^\d{16}$/.test(patient.ihi)) {
            return res.status(400).send('Invalid IHI number format used');
        }
        const result = await runGetView(patient, organization, viewOptions);
        console.log("this is result",result);
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send(result);
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.listen(3031, () => {
    console.log('\x1b[36m%s\x1b[0m', 'StrongRoomAi MHR-mobule running on http://localhost:3031/');
});
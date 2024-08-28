const services = require('./index.js');
const axios = require('axios'); // Import axios
const fs = require('fs');
let guid = require('uuid').v4;
let hpio = "8003623233372670";
let shasum = require('crypto');
// let hpio = "8003623233372670";
let privatePem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.private.pem");
let publicPem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.public.pem");
let ca = fs.readFileSync("./sample/entities/certificates/certificate_authorities//certificates_chain.pem");

function generateUniqueId() {
  // Generate a UUID
  const uuid = guid();

  // Remove the hyphens from the UUID
  const uuidWithoutHyphens = uuid.replace(/-/g, '');

  // Convert the UUID to a large number by taking a slice of it
  // The slice should be long enough to ensure uniqueness but within 17 digits
  const uniqueId = parseInt(uuidWithoutHyphens.slice(0, 17), 16);

  // Ensure the ID is a 17-digit number (this might need adjustment based on UUID structure)
  return uniqueId.toString().padStart(17, '0');
}


//runRemoveDocument
async function runRemoveDocument(patient, remove_document_id, reasons, organisation) {

  try {

    const existResult = await services.myHealthRecord.removeDocument({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      {
        id: "patient-001",
        medicareNumber: "4951653701",
        name: patient.first_name + patient.last_name,
        dob: patient.dob,
        ihi: patient.ihi
      },
      remove_document_id,
      reasons
    );

    // console.log('Result:', existResult);
    return existResult;
    // const accessResult = await services.gainAccess(/* parameters */);
    // console.log('gainAccess result:', accessResult);

    // const docListResult = await services.getDocumentList(/* parameters */);
    // console.log('getDocumentList result:', docListResult);

    // const documentResult = await services.getDocument(/* parameters */);
    // console.log('getDocument result:', documentResult);

    // const uploadResult = await services.uploadDocument(/* parameters */);
    // console.log('uploadDocument result:', uploadResult);

    // const viewResult = await services.getView(/* parameters */);
    // console.log('getView result:', viewResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}
async function downloadFile(url) {
  try {
    // Download the file and return it as a buffer
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch file from URL: ${error.message}`);
  }
}
async function runUploadDocument(patient, supersede_document_id, template_id, organisation, document) {
  const filePath = './doc.xml';
  // const attachmentPath = './NCFU.pdf';
  const attachmentUrl = document;

  try {
    let package_data = await fs.promises.readFile(filePath);
    // let attachment = await fs.promises.readFile(attachmentPath);
    let attachment = await downloadFile(attachmentUrl);
    console.log("attached file: ", attachment);

    const now = new Date();
    const formattedDate = now.toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14) + "00";

    // let documentObjectId = "1.2.36.2501047616.37544.18039.36495.{{unique_id}}";
    let documentObjectId = "1.2.36.1.2001.1005.11.{{unique_id}}";
    //1.2.36.1.2001.1005.11
    let unique_id = generateUniqueId();
    let documentId = documentObjectId.replace("{{unique_id}}", unique_id);
    console.log("this is unique document_id ", documentId);
    // console.log(documentId);

    // shasum.update(attachment);

    // console.log("Digest of the attachment: ", shasum.digest('base64'),)

    const packageResult = await services.cda.package(
      patient,
      documentId,
      package_data.toString(),
      {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      },
      {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"],
            prefix: ["Mr"],
            suffix: ["II"],
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      [
        {
          "filename": "NCFU.pdf",
          "buffer": attachment
        }
      ]
    )
    let hash = shasum.createHash('sha1');
    hash.update(packageResult);
    const digest = hash.digest('base64');
    // console.log('Result:', packageResult);

    fs.writeFile("./testPackage/cda_package.zip", packageResult, function (err) {
      if (err) {
        return console.log(err);
      }
    });

    const existResult = await services.myHealthRecord.uploadDocument({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      {
        id: "patient-001",
        medicareNumber: "4951653701",
        name: patient.first_name + patient.last_name,
        dob: patient.dob,
        ihi: patient.ihi
      },
      // {
      //   id: "patient-001",
      //   medicareNumber: "4951653701",
      //   name: "Melody GAYNOR",
      //   dob: "1955-02-07",
      //   ihi: "8003608333647477"
      // },
      // this is single document
      {
        "metadata": {
          "creationTime": "20240321",
          "serviceStartTime": "20240321",
          "serviceStopTime": "20240321",
          "sourcePatientId": `${patient.ihi}^^^&1.2.36.1.2001.1003.0&ISO`,
          "hash": digest,
          "size": packageResult.byteLength,
          "name": "Residential Care Medication Chart",
          "repositoryUniqueId": "1.2.36.1.2001.1007.10.8003640002000050",
          "authorInstitution": {
            "authorInstitution": "Strong Room^^^^^^^^^1.2.36.1.2001.1003.0.8003623233372670",
            "organizationName": "Strong Room",
            "organizationIdentifier": "1.2.36.1.2001.1003.0.8003623233372670"
          },
          "authorPerson": {
            "authorPerson": "^FORD^Maisie^^^Ms^^^&1.2.36.1.2001.1003.0.8003611566713495&ISO",
            "familyName": "FORD",
            "firstGivenName": "Maisie",
            "assigningAuthority": "&1.2.36.1.2001.1003.0.8003611566713495&ISO"
          },
          "authorSpecialty": "General Medical Practitioner",
          "class": {
            "code": "80565-5",
            "codingScheme": "LOINC",
            "displayName": "Residential Care Medication Chart",
          },
          "format": {
            "codingScheme": "PCEHR_FormatCodes",
            "displayName": "eDS"
          },
          "healthcareFacilityType": {
            "code": "8511",
            "codingScheme": "ANZSIC",
            "displayName": "General Practice"
          },
          "practiceSetting": {
            "code": "8511-3",
            "codingScheme": "ANZSIC",
            "displayName": "General practice medical clinic service"
          },
          "type": {
            "code": "100.32046",
            "codingScheme": "NCTIS Data Components",
            "displayName": "Residential Care Medication Chart"
          },
          "patientId": patient.ihi,
          "documentId": documentId
          // documentId = CheckNullValue(cdaDocument.SelectSingleNode("/cda:ClinicalDocument/cda:id/@root", xnm));
        },
        package: packageResult,
      },
      supersede_document_id,
      template_id && template_id ? template_id : "1.2.36.1.2001.1006.1.32046.2"
    );

    // console.log('Result:', existResult);
    return existResult;
    return hash;
    // const accessResult = await services.gainAccess(/* parameters */);
    // console.log('gainAccess result:', accessResult);

    // const docListResult = await services.getDocumentList(/* parameters */);
    // console.log('getDocumentList result:', docListResult);

    // const documentResult = await services.getDocument(/* parameters */);
    // console.log('getDocument result:', documentResult);

    // const uploadResult = await services.uploadDocument(/* parameters */);
    // console.log('uploadDocument result:', uploadResult);

    // const viewResult = await services.getView(/* parameters */);
    // console.log('getView result:', viewResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function runDoesPCEHRExist(patient, organisation) {
  try {
    const existResult = await services.myHealthRecord.doesPCEHRExist({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      // organisation: {
      //   name: "Strong Room",
      //   id: "4991012131",
      //   contact: "info@cityhospital.com",
      //   privatePem,
      //   publicPem,
      //   ca,
      //   hpio,
      // }
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      patient
      // {
      //   id: "patient-001",
      //   medicareNumber: "4951653701",
      //   name: "Melody GAYNOR",
      //   dob: "1955-02-07",
      //   ihi: "8003608333647477"
      // }
    );

    console.log('Result:', existResult);
    return existResult;

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function runGainPCEHRAccess(patient, organisation, accessType, accessCode) {
  try {
    const existResult = await services.myHealthRecord.gainAccess({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      // organisation: {
      //   name: "Strong Room",
      //   id: "4991012131",
      //   contact: "info@cityhospital.com",
      //   privatePem,
      //   publicPem,
      //   ca,
      //   hpio,
      // }
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      patient,
      accessType ? accessType : "noAccessCode",
      accessCode ? accessCode : ""
      // {
      //   id: "patient-001",
      //   medicareNumber: "4951653701",
      //   name: "Melody GAYNOR",
      //   dob: "1955-02-07",
      //   ihi: "8003608333647477"
      // }
    );

    console.log('Result:', existResult);
    return existResult;

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

//runGetDocumentList
async function runGetDocumentList(patient, organisation, adhoc_query_id, documentTypes, documentClass, status, timeFrom, timeTo) {
  try {

    const existResult = await services.myHealthRecord.getDocumentList({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      patient,
      // Options to query document List
      {
        status: status || "Approved",
        serviceStopTimeTo: timeTo ? new Date(timeTo) : new Date(),
        serviceStopTimeFrom: timeFrom ? new Date(timeFrom) : new Date('2024-01-01'),
        documentTypes,
        documentClass
      },
      adhoc_query_id && adhoc_query_id !== null ? adhoc_query_id : "urn:uuid:14d4debf-8f97-4251-9a74-a90016b0af0d"
    );

    console.log('Result:', existResult);
    return existResult;

    // const accessResult = await services.gainAccess(/* parameters */);
    // console.log('gainAccess result:', accessResult);

    // const docListResult = await services.getDocumentList(/* parameters */);
    // console.log('getDocumentList result:', docListResult);

    // const documentResult = await services.getDocument(/* parameters */);
    // console.log('getDocument result:', documentResult);

    // const uploadResult = await services.uploadDocument(/* parameters */);
    // console.log('uploadDocument result:', uploadResult);

    // const viewResult = await services.getView(/* parameters */);
    // console.log('getView result:', viewResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}
//runGetDocument
async function runGetDocument(patient, organisation, document) {
  try {

    const existResult = await services.myHealthRecord.getDocument({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      patient,
      // Options to query document List
      document
    );

    console.log('Result:', existResult);
    return existResult;

    // const accessResult = await services.gainAccess(/* parameters */);
    // console.log('gainAccess result:', accessResult);

    // const docListResult = await services.getDocumentList(/* parameters */);
    // console.log('getDocumentList result:', docListResult);

    // const documentResult = await services.getDocument(/* parameters */);
    // console.log('getDocument result:', documentResult);

    // const uploadResult = await services.uploadDocument(/* parameters */);
    // console.log('uploadDocument result:', uploadResult);

    // const viewResult = await services.getView(/* parameters */);
    // console.log('getView result:', viewResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function runGetView(patient, organisation, viewOptions) {
  try {

    const existResult = await services.myHealthRecord.getView({
      product: {
        vendor: "StrongRoom AI",
        name: "StrongCare",
        version: "1.0",
        id: "4991012131",
        clientSystemType: "CSP",
        platform: "CSP"
      },
      user: {
        IdType: "RA",
        id: "49910121312",
        name: [
          {
            user: "L",
            family: "FORD",
            given: ["Maisie"]
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
      },
      organisation: {
        name: organisation && organisation.name ? organisation.name : "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio: organisation && organisation.hpio ? organisation.hpio : hpio,
      }
    },
      // patient
      patient,
      // Options to query document List
      viewOptions
    );

    console.log('Result:', existResult);
    return existResult;

    // const accessResult = await services.gainAccess(/* parameters */);
    // console.log('gainAccess result:', accessResult);

    // const docListResult = await services.getDocumentList(/* parameters */);
    // console.log('getDocumentList result:', docListResult);

    // const documentResult = await services.getDocument(/* parameters */);
    // console.log('getDocument result:', documentResult);

    // const uploadResult = await services.uploadDocument(/* parameters */);
    // console.log('uploadDocument result:', uploadResult);

    // const viewResult = await services.getView(/* parameters */);
    // console.log('getView result:', viewResult);

  } catch (error) {
    console.error('An error occurred:', error);
  }
}
// Run the function
// runServices();
module.exports = {
  runUploadDocument,
  runDoesPCEHRExist,
  runGainPCEHRAccess,
  runGetDocumentList,
  runGetDocument,
  runGetView,
  runRemoveDocument
  // anotherFunction
};
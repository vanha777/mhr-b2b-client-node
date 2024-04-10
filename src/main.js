const services = require('./index.js');
const fs = require('fs');

let hpio = "8003623233372670";
let privatePem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.private.pem");
let publicPem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.public.pem");
let ca = fs.readFileSync("./sample/entities/certificates/certificate_authorities//certificates_chain.pem");

// Assuming these functions return promises; using async/await for handling them.

async function runServices() {
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
            family: "Farman",
            given: ["Philip", "James"],
            prefix: ["Mr"],
            suffix: ["II"],
          }
        ],
        hpii: "8003611566713495"
      },
      organisation: {
        name: "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio,
      }
    },
      // this is patient 
      {
        id: "patient-001",
        medicareNumber: "8003604570631431",
        name: "John Doe",
        dob: "1990-01-01",
        ihi: "8003608166980706"
      },
      //this is single document
      // {
      //   "creationTime": "20240313053310",
      //   "serviceStartTime": "20200611013225",
      //   "serviceStopTime": "20240313053310",
      //   "sourcePatientId": "8003608666701594^^^&1.2.36.1.2001.1003.0&ISO",
      //   "hash": "264e81560204758feb0ec3e5d7cb9d1ad28b306e",
      //   "size": "47931",
      //   "repositoryUniqueId": "1.2.36.1.2001.1007.10.8003640002000050",
      //   "authorInstitution": {
      //     "hl7": "MEDTESTORGSB120^^^^^^^^^1.2.36.1.2001.1003.0.8003629900019338",
      //     "organizationName": "MEDTESTORGSB120",
      //     "organizationIdentifier": "1.2.36.1.2001.1003.0.8003629900019338"
      //   },
      //   "authorPerson": {
      //     "hl7": "^Jones^^^^Sir^^^&1.2.36.1.2001.1003.0.8003615833334118&ISO",
      //     "familyName": "Jones",
      //     "firstGivenName": "Christine",
      //     "assigningAuthority": "&1.2.36.1.2001.1003.0.8003615833334118&ISO"
      //   },
      //   "authorSpecialty": "General Medical Practitioner",
      //   "class": {
      //     "code": "1.2.36.1.2001.1006.1.16473.14",
      //     "codingScheme": "LOINC",
      //     "displayName": "Event Summary"
      //   },
      //   "format": {
      //     "codingScheme": "PCEHR_FormatCodes",
      //     "displayName": "Event Summary Report 3A"
      //   },
      //   "healthcareFacilityType": {
      //     "code": "8511",
      //     "codingScheme": "ANZSIC",
      //     "displayName": "General Practice"
      //   },
      //   "practiceSetting": {
      //     "code": "8511-3",
      //     "codeSystem": "ANZSIC",
      //     "displayName": "General practice medical clinic service"
      //   },
      //   "type": {
      //     "code": "34133-9",
      //     "codingScheme": "LOINC",
      //     "displayName": "Event Summary"
      //   },
      //   "patientId": "8003608666701594",
      //   "documentId": "2.25.235434944956345595199871874379337165199"
      // }      

      //Options to query document List
      {
        serviceStopTimeTo: 		new Date(),
        serviceStopTimeFrom:	new Date(2024,'01','01'),
        // documentTypes: [
        //   '60591-5^^LOINC',
        //   '57133-1^^LOINC',
        //   '51852-2^^LOINC',
        //   '18842-5^^LOINC',
        //   '34133-9^^LOINC',
        //   '100.17042^^NCTIS'
        // ]
      }
    );
    console.log('doesPCEHRExist result:', existResult);

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
runServices();

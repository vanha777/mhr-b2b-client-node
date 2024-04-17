const services = require('./index.js');
const fs = require('fs');

let hpio = "8003623233372670";
// let hpio = "8003624900038396";
let privatePem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.private.pem");
let publicPem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.public.pem");
let ca = fs.readFileSync("./sample/entities/certificates/certificate_authorities//certificates_chain.pem");

// Assuming these functions return promises; using async/await for handling them.

const filePath = './doc.xml';

async function runServices() {
  try {

    let package_data = await fs.promises.readFile(filePath);

    const packageResult = await services.cda.package(
      package_data.toString(), 
      {
        name: "Strong Room",
        id: "4991012131",
        contact: "info@cityhospital.com",
        privatePem,
        publicPem,
        ca,
        hpio,
      },
      {
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
        // hpio: ""
      }
    )

    // console.log('Result:', packageResult);

    fs.writeFile("./cda_package.zip", packageResult, function (err) {
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
            family: "Farman",
            given: ["Philip", "James"],
            prefix: ["Mr"],
            suffix: ["II"],
          }
        ],
        hpii: "8003611566713495"
        // hpio: ""
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
    // patient
    {
      id: "patient-001",
      medicareNumber: "8003604570631431",
      name: "John Doe",
      dob: "1990-01-01",
      ihi: "8003608666976659"
    },
    // this is single document
    {
      "metadata": {
          "creationTime": "201206201818",
          "serviceStartTime": "201206201818",
          "serviceStopTime": "201206201818",
          "sourcePatientId": "8003608666976659^^^&1.2.36.1.2001.1003.0&ISO",
          "hash": "264e81560204758feb0ec3e5d7cb9d1ad28b306e",
          "size": "47931",
          "name": "Event Summary",
  
        "repositoryUniqueId": "1.2.36.1.2001.1007.10.8003640002000050",
          "authorInstitution": {
              "authorInstitution": "MediHomeCroydon^^^^^^^^^1.2.36.1.2001.1003.0.8003629900001245",
              "organizationName": "MediHomeCroydon",
              "organizationIdentifier": "1.2.36.1.2001.1003.0.8003629900001245"
          },
          "authorPerson": {
              "authorPerson": "^Javad^Chris^^^^Sir^^^&1.2.36.1.2001.1003.0.8003613233333558&ISO",
              "familyName": "Javad",
              "firstGivenName": "Chris",
              "assigningAuthority": "&1.2.36.1.2001.1003.0.8003613233333558&ISO"
          },
          "authorSpecialty": "General Medical Practitioner",
          "class": {
              "code": "1.2.36.1.2001.1006.1.16659.6",
              "codingScheme": "LOINC",
              "displayName": "Australian Childhood Immunisation Register"
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
              "code": "34133-9",
              "codingScheme": "LOINC",
              "displayName": "Event Summary"
          },
          "patientId": "8003608666976659",
          "documentId": "1.3.16.1.38818.74789806"
      },
      package: packageResult,
    },     

      // Options to query document List
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

    console.log('Result:', existResult);

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

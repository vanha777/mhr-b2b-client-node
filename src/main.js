const services = require('./index.js');
const fs = require('fs');

let hpio = "8003623233372670";
// let hpio = "8003624900038396";
let privatePem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.private.pem");
let publicPem = fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.public.pem");
let ca = fs.readFileSync("./sample/entities/certificates/certificate_authorities//certificates_chain.pem");

const shasum = require('crypto').createHash('sha1');

const filePath = './doc.xml';
const attachmentPath = './NCFU.pdf';

async function runServices() {
  try {

    let package_data = await fs.promises.readFile(filePath);
    let attachment = await fs.promises.readFile(attachmentPath);
    console.log("attached file: ", attachment);

    const now = new Date();
    const formattedDate = now.toISOString()
      .replace(/[-:T]/g, '')
      .slice(0, 14) + "00";

    let documentObjectId = "36-2501047616-37544-18039-36495-170410403036301";

    let documentId = '2.25.' + BigInt('0x' + documentObjectId.replace(/-/g, '')).toString()

    console.log(documentId);

    // shasum.update(attachment);

    // console.log("Digest of the attachment: ", shasum.digest('base64'),)

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

    shasum.update(packageResult);

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
            family: "FORD",
            given: ["Maisie"]
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
        medicareNumber: "5951139631",
        name: "Merrilee JOHNS",
        dob: "1982-06-10",
        ihi: "8003608000311951"
      },
      // this is single document
      {
        "metadata": {
          "creationTime": "20240321",
          "serviceStartTime": "20240321",
          "serviceStopTime": "20240321",
          "sourcePatientId": "8003608000311951^^^&1.2.36.1.2001.1003.0&ISO",
          "hash": shasum.digest('base64'),
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
          "patientId": "8003608000311951",
          "documentId": "1.2.36.2501047616.37544.18039.36495.17041040303639132" // documentId = CheckNullValue(cdaDocument.SelectSingleNode("/cda:ClinicalDocument/cda:id/@root", xnm));
        },
        package: packageResult,
      },

      // Options to query document List
      {
        serviceStopTimeTo: new Date(),
        serviceStopTimeFrom: new Date(2024, '01', '01'),
        documentTypes: [
          // '60591-5^^LOINC',
          // '57133-1^^LOINC',
          // '51852-2^^LOINC',
          // '18842-5^^LOINC',
          // '34133-9^^LOINC',
          // '100.17042^^NCTIS',
          '100.32046^^NCTIS' // RCMC
        ]
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

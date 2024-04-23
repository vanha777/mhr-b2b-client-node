let moment = require('moment');
const shasum = require('crypto').createHash('sha1');
let createHl7DataType = require('../my-health-record/hl7').createHl7DataType;

let eventSummaryMetadata = (summary, package) => {
	shasum.update(package);
	return {
		name: 'Event Summary',
		creationTime: moment(summary.dateTimeOfsummaryEvent).format("YYYYMMDDHHmmss"),
		serviceStartTime: moment(summary.dateTimeOfsummaryEvent).format("YYYYMMDDHHmmss"),
		serviceStopTime: moment(summary.dateTimeOfsummaryEvent).format("YYYYMMDDHHmmss"),
		sourcePatientId: `${summary.patient.ihi}^^^&1.2.36.1.2001.1003.0&ISO`,	//todo:  the amps might need to be xml escaped like in the philware examples 8003608666885561^^^&amp;1.2.36.1.2001.1003.0&amp;ISO.
		hash: shasum.digest('base64'),
		size: package.byteLength,
		repositoryUniqueId: '1.2.36.1.2001.1007.10.8003640002000050',
		authorInstitution:
		{
			hl7: createHl7DataType("XON", summary.authorOrganisation),
			organizationName: summary.authorOrganisation.name,
			organizationIdentifier: `1.2.36.1.2001.1003.0.${summary.authorOrganisation.hpio}`
		},
		authorPerson: {
			hl7:"^Maisie^^FORD^^Sir^^^&1.2.36.1.2001.1003.0.8003611566713495&ISO",
			authorPerson: "^Maisie^^FORD^II^Mr^^^&1.2.36.1.2001.1003.0.8003611566713495&ISO",
			familyName: "Maisie",
			firstGivenName: "FORD",
			assigningAuthority: "&1.2.36.1.2001.1003.0.8003611566713495&ISO"
		},
		authorSpecialty: "General Medical Practitioner",
		class: {
			code: '1.2.36.1.2001.1006.1.16659.6',
			codingScheme: 'LOINC',
			displayName: 'Australian Childhood Immunisation Register'
		},
		format: {
			codingScheme: 'PCEHR_FormatCodes',
			displayName: 'Event Summary Report 3A'
		},
		healthcareFacilityType: {
			code: "8511",
			codingScheme: "ANZSIC",
			displayName: "General Practice"
		},
		practiceSetting: {
			code: "8511-3",
			codingScheme: "ANZSIC",
			displayName: "General practice medical clinic service"
		},
		type: {
			code: "100.16681",
			codingScheme: "LOINC",
			displayName: "Event Summary"
		},
		patientId: summary.patient.ihi,
		// documentId:				'2.25.'+BigInt('0x'+summary.summary.id.replace(/-/g,'')).toString()
		documentId: "2.25.1954060294"
	};
};

module.exports = eventSummaryMetadata;
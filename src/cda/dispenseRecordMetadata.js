let		moment = require('moment');
const	shasum = require('crypto').createHash('sha1');
let createHl7DataType = require('../my-health-record/hl7').createHl7DataType;

let dispenseRecordMetadata = (dispense, package) => {
	shasum.update(package);
	return {
		name: 					'eHealth Dispense Record',
		creationTime:			moment(dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmss"),
		serviceStartTime: 		moment(dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmss"),
		serviceStopTime: 		moment(dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmss"),
		sourcePatientId: 		`${dispense.patient.ihi}^^^&amp;1.2.36.1.2001.1003.0&amp;ISO`,	//todo:  the amps might need to be xml escaped like in the philware examples 8003608666885561^^^&amp;1.2.36.1.2001.1003.0&amp;ISO.
		hash: 					shasum.digest('base64'),
		size: 					package.byteLength,
		repositoryUniqueId: 	'1.2.36.1.2001.1007.10.8003640002000050',
		authorInstitution:
								{	
									hl7: createHl7DataType("XON", dispense.authorOrganisation),
									organizationName: dispense.authorOrganisation.name,
									organizationIdentifier: `1.2.36.1.2001.1003.0.${dispense.authorOrganisation.hpio}`
								},
		authorPerson:			{	
									hl7: createHl7DataType("XCN", dispense.authorIndividual),
									assigningAuthority: '&1.2.36.1.2001.1003.0.8003619166674595&ISO'
								},
		authorSpecialty:		dispense.authorIndividual.type.displayName,
		class:					{
									code: '1.2.36.1.2001.1006.1.171.5',
									codingScheme: 'NCTIS Data Components',
									displayName: 'eHealth Dispense Record'
								},
		format:					{
									codingScheme: 'PCEHR_FormatCodes',
									displayName: 'Dispense 3A'
								},
		healthcareFacilityType:	dispense.authorOrganisation.healthcareFacilityType,
		practiceSetting:		dispense.authorOrganisation.practiceSetting,
		type:					{
									code: '100.16765',
									codingScheme: 'NCTIS Data Components',
									displayName: 'eHealth Dispense Record'
								},
		patientId:				dispense.patient.ihi,
		documentId:				'2.25.'+BigInt('0x'+dispense.dispense.id.replace(/-/g,'')).toString()
	};
};

module.exports = dispenseRecordMetadata;
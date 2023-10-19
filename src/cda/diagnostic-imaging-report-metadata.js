let		moment 							= require('moment');
let		crypto 							= require('crypto');
let 	createHl7DataType 				= require('../my-health-record/hl7').createHl7DataType;
const	mapPathologyToCommonObjectMap 	= require('./pathology-common-object-mapping');

let pathologyReportMetadata = (documentObject, package) => {
	
	let shasum = crypto.createHash('sha1');
	const documentDetails = mapPathologyToCommonObjectMap(documentObject);
	
	shasum.update(package);
	return {
		name: 					'Pathology Report',
		creationTime:			moment(documentDetails.commonElements.authorTime).format("YYYYMMDDHHmmss"),
		serviceStartTime: 		moment(documentDetails.report.diagnosticImagingResults.map(test => test.imageDateTime).reduce((latestDate, date, ) => latestDate.MeasureDate > date.MeasureDate ? latestDate : date)).format("YYYYMMDDHHmmss"),
		serviceStopTime: 		moment(documentDetails.report.diagnosticImagingResults.map(test => test.imageDateTime).reduce((latestDate, date, ) => latestDate.MeasureDate > date.MeasureDate ? latestDate : date)).format("YYYYMMDDHHmmss"),
		sourcePatientId: 		`${documentDetails.patient.ihi}^^^&amp;1.2.36.1.2001.1003.0&amp;ISO`,	//todo:  the amps might need to be xml escaped like in the philware examples 8003608666885561^^^&amp;1.2.36.1.2001.1003.0&amp;ISO.
		hash: 					shasum.digest('base64'),
		size: 					package.byteLength,
		repositoryUniqueId: 	'1.2.36.1.2001.1007.10.8003640002000050',
		authorInstitution:
								{
									hl7: createHl7DataType("XON", documentDetails.authorOrganisation),
									organizationName: documentDetails.authorOrganisation.name,
									organizationIdentifier: `1.2.36.1.2001.1003.0.${documentDetails.authorOrganisation.hpio}`
								},
		authorPerson:			{	
									hl7: createHl7DataType("XCN", documentDetails.authorIndividual),
									assigningAuthority: '&1.2.36.1.2001.1003.0.8003619166674595&ISO'
								},
		authorSpecialty:		documentDetails.authorIndividual.type.displayName,
		class:					documentDetails.config.documentCode,
		format:					documentDetails.config.formatCode,
		type:					documentDetails.config.typeCode,
		healthcareFacilityType:	documentDetails.authorOrganisation.healthcareFacilityType,
		practiceSetting:		documentDetails.authorOrganisation.practiceSetting,
		patientId:				documentDetails.patient.ihi,
		documentId:				'2.25.'+BigInt('0x'+documentObject.id.replace(/-/g,'')).toString()
	};
};

module.exports = pathologyReportMetadata;
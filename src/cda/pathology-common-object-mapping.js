let 	guid	= require('uuid').v4;


let mapPathologyToCommonObjectMap = documentObject => {
	let documentDefaults = {
		patient:{uniqueId: guid()},
		authorOrganisation:{uniqueId: guid()},
		authorIndividual:{uniqueId: guid()},
	};

	
	let documentDetails = {
		patient: 			{...documentDefaults.patient,...documentObject.patient},
		authorIndividual: 	{...documentDefaults.authorIndividual, ...documentObject.authorIndividual},
		authorOrganisation: {...documentDefaults.authorOrganisation,...documentObject.authorOrganisation},
		referrer:			{...documentObject.referrer},
		referrerDateTime:	documentObject.referrerDateTime,
		report: 			documentObject.report,
		metadata: 			documentObject.metadata,
		attachments:		documentObject.attachments ? documentObject.attachments : [],
		commonElements:		{
			id: 				documentObject.id,
			effectiveTime:		documentObject.report.date, 	//todo map this properly
			authorTime:			documentObject.report.date,		//todo map this properly
			title: "Pathology Report",
			commonElements: 	[],
			templatesIds: [
				{
					root:"1.2.36.1.2001.1001.100.1002.220",
					extension:"1.0"
				},
				{
					root:"1.2.36.1.2001.1001.100.149",
					extension:"1.0"
				}
			]
		},
		config: {
			authorOrganisationDetailsAssignedToAuthorPerson: true,	//does the CDA IG attach the organisation details to the author (true)
			authorOrganisationStoredAsEncompassingEncounter: false,
			documentCode: {
				code: "100.32001",
				codeSystem:"1.2.36.1.2001.1001.101" ,
				codeSystemName:"NCTIS Data Components",
				displayName:"Pathology Report"
			},
			formatCode: {
				code: "1.2.36.1.2001.1006.1.220.4",
				codingScheme: 'PCEHR_FormatCodes',
				displayName: 'Path 3A HPII'
			},
			typeCode: {
				code: "100.32001",
				codeSystem:"1.2.36.1.2001.1001.101" ,
				codeSystemName:"NCTIS Data Components",
				displayName:"Pathology Report"
			}
		}
	};
	if (documentDetails.authorOrganisation.logo){
		if (!documentDetails.attachments.includes(documentDetails.authorOrganisation.logo)){
			documentDetails.attachments.push(documentDetails.authorOrganisation.logo);
		}
	}

	if (documentDetails.report.reportPdf){
		if (!documentDetails.attachments.includes(documentDetails.report.reportPdf)){
			documentDetails.attachments.push(documentDetails.report.reportPdf);
		}
	}
	return documentDetails;


}

module.exports = mapPathologyToCommonObjectMap;

/*
 * Copyright 2021 The Australian Digital Health Agency
 *
 * Licensed under the Australian Digital Health Agency Open Source (Apache) License; you may not use this
 * file except in compliance with the License. A copy of the License is in the
 * 'license.txt' file, which should be provided with this work.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

let 	guid	= require('uuid').v4;


let mapDiagnisticImagingToCommonObjectMap = documentObject => {
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
			title: "Diagnostic Imaging Report",
			commonElements: 	[],
			templatesIds: [
				{
					root:"1.2.36.1.2001.1001.100.1002.222",
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
				code: "100.16957",
				codeSystem:"1.2.36.1.2001.1001.101" ,
				codeSystemName:"NCTIS Data Components",
				displayName:"Diagnostic Imaging Report"
			},
			formatCode: {
				code: "1.2.36.1.2001.1006.1.222.4",
				codingScheme: 'PCEHR_FormatCodes',
				displayName: 'DI 3A HPII'
			},
			typeCode: {
				code: "100.16957",
				codeSystem:"1.2.36.1.2001.1001.101" ,
				codeSystemName:"NCTIS Data Components",
				displayName:"Diagnostic Imaging Report"
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

module.exports = mapDiagnisticImagingToCommonObjectMap;

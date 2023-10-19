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

let patient = require('./patients').FRANKHARDING
let guid 	= require('uuid').v4;

let providerIndividuals = require('./provider-individuals');
let providerOrganisations = require('./provider-organisations');


let pathologyReport = {
	type: 					"Pathology Report",
	patient,
	authorIndividual: 		providerIndividuals.pathologist[0],
	authorOrganisation: 	providerOrganisations.PATHOLOGYLAB[0],
	referrer: 				providerIndividuals.generalPractitioner[0],
	referrerDateTime: 		new Date('2020-01-21T15:24:50'),
	id:						guid(),
	report: {
		completionCode: {
			code:"F",
			codeSystem: "1.2.36.1.2001.1001.101.104.20104",
			codeSystemName: "NCTIS Document Status Values",
			displayName: "Final"
		},
		name: "General Pathology Test",
		documentStatus: {
			code:"F",
			codeSystem:"2.16.840.1.113883.12.123",
			codeSystemName:"HL7 Result Status",
			displayName:"Final results; results stored and verified. Can only be changed with a corrected result."
		},
		date: new Date(),
		tests: [
			{
				collectionDate: new Date(),
				observationDate: new Date(),
				code: {
					code:			"9718006",
					codeSystem:		"2.16.840.1.113883.6.96",
					codeSystemName:	"SNOMED CT-AU",
					displayName:	"Polymerase chain reaction analysis",
					originalText: 	"PCR Analysis"
				},
				discipline: {
					code:			"CH",
					codeSystem:		"2.16.840.1.113883.12.74",
					codeSystemName:	"HL7 Diagnostic service section ID",
					displayName:	"Chemistry", 
				},
				status: {
					code:"F",
					codeSystem:"2.16.840.1.113883.12.123",
					codeSystemName:"HL7 Result Status",
					displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
					originalText: "Final"
				},
				individualPathologyTestResults: [
					{
						name: {
							originalText:	"Influenceza A RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText:"Final"

						}
					},{
						name: {
							originalText:	"Influenceza B RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText: "Final"
						}
					},{
						name: {
							originalText:	"Rhinovirus RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText: "Final"
						}
					},{
						name: {
							originalText:	"SARS-CoV-2", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText: "Final"
						}
					}
				]
			},
			{
				collectionDate: new Date(),
				observationDate: new Date(),
				code: {
					code:			"275711006",
					codeSystem:		"2.16.840.1.113883.6.96",
					codeSystemName:	"SNOMED CT-AU",
					displayName:	"Serum chemistry test",
				},
				discipline: {
					code:			"CH",
					codeSystem:		"2.16.840.1.113883.12.74",
					codeSystemName:	"HL7 Diagnostic service section ID",
					displayName:	"Chemistry", 
				},
				status: {
					code:"F",
					codeSystem:"2.16.840.1.113883.12.123",
					codeSystemName:"HL7 Result Status",
					displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
					originalText:"Final"

				},
				individualPathologyTestResults: [
					{
						name: {
							originalText:	"Influenceza A RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText:"Final"

						}
					},{
						name: {
							originalText:	"Influenceza B RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText:"Final"		
						}
					},{
						name: {
							originalText:	"Rhinovirus RNA", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText:"Final"		

						}
					},{
						name: {
							originalText:	"SARS-CoV-2", 
						},
						value: {
							code:			"260415000",
							codeSystem:		"2.16.840.1.113883.6.96",
							codeSystemName:	"SNOMED CT-AU",
							displayName:	"Not detected",
							originalText: 	"Not detected"
						},
						status: {
							code:"F",
							codeSystem:"2.16.840.1.113883.12.123",
							codeSystemName:"HL7 Result Status",
							displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
							originalText:"Final"		

						}
					}
				]
			}
		],
		relatedDocuments: [{
			typeCode: "XFRM",
			id: {
				root: "2.666.42",
				extension: guid()
			},
			text: {
				nullFlavor: "NA"
			}
		}]
	},
	metadata: {
		'version': 1,
		'setId': guid()
	}};



let diagnosticImagingReport = {
	type: "Diagnostic Imaging Report",
	patient,
	authorIndividual: providerIndividuals.radiologist[0],
	authorOrganisation: providerOrganisations.DIAGNOSTICIMAGINGPRACTICE[0],
	referrer: providerIndividuals.generalPractitioner[0],
	referrerDateTime: new Date('2020-01-21T15:24:50'),
	id: guid(),
	report: {
		completionCode: {
			code:"F",
			codeSystem: "1.2.36.1.2001.1001.101.104.20104",
			codeSystemName: "NCTIS Document Status Values",
			displayName: "Final"
		},
		documentStatus: {
			code:"F",
			codeSystem:"2.16.840.1.113883.12.123",
			codeSystemName:"HL7 Result Status",
			displayName:"Final results; results stored and verified. Can only be changed with a corrected result."
		},
		date: new Date(),
		type: {},
		documentTitle: "example DI",
		diagnosticImagingResults: [
			{
				imagingExaminationResultName: {
					originalText: "Right Arm X-Ray"
				},
				imagingModality: {
					originalText: "X-Ray"
				},
				anatomicalSite: {
					name: {
						originalText: "Arm"
					},
					laterality: {
						originalText: "Right"
					}
				},
				anatomicalRegion: {},
				imagingExaminationResultStatus: {
					code:"F",
					codeSystem:"2.16.840.1.113883.12.123",
					codeSystemName:"HL7 Result Status",
					displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
					originalText: "Final"
				},
				imageDateTime: new Date('2020-01-21T15:24:50'),
				examinationProcedure: "Right Arm X-Ray",
				observationDateTime: new Date('2020-01-21T15:45:32'),
				relatedImages: {
					location: "https://example.com"
				}
			},
			{
				imagingExaminationResultName: {
					originalText: "Right Arm X-Ray"
				},
				imagingModality: {
					originalText: "X-Ray"
				},
				anatomicalSite: {
					name: {
						originalText: "Right Arm"
					}
				},
				anatomicalRegion: {},
				imagingExaminationResultStatus: {
					code:"F",
					codeSystem:"2.16.840.1.113883.12.123",
					codeSystemName:"HL7 Result Status",
					displayName:"Final results; results stored and verified. Can only be changed with a corrected result.",
					originalText: "Final"
				},
				imageDateTime: new Date('2020-01-21T15:24:50'),
				examinationProcedure: "Right Arm X-Ray",
				observationDateTime: new Date('2020-01-21T15:45:32'),
				relatedImages: {
					location: "https://example.com"
				}
			}
		],
		relatedDocuments: [{
			typeCode: "XFRM",
			id: {
				root: "2.666.42",
				extension: guid()
			},
			text: {
				nullFlavor: "NA"
			}
		}]
	},
	metadata: {
		'version': 1,
		'setId': guid()
	}};



module.exports = {
	pathologyReports: [
		pathologyReport
	],
	diagnosticImagingReports: [
		diagnosticImagingReport
	]
}
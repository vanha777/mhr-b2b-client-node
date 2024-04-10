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

const fs = require('fs');

let hpio = "8003628233372588";

let privatePem 	= fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.private.pem");
let publicPem 	= fs.readFileSync("./sample/entities/certificates/fac_sign_nash_org_with_attributes.public.pem");
let ca 			= fs.readFileSync("./sample/entities/certificates/certificate_authorities//certificates_chain.pem");


let pharmacyOrganisation = {
	privatePem,
	publicPem,
	ca,
	logo: {filename: "logo.jpg", buffer: fs.readFileSync("./sample/entities/organisations/examplepharmacylogo.jpg"), mediaType: "image/jpeg"},
	type: {displayName: "Pharmacy", code: "PHARM"},
	healthcareFacilityType: { code: '4271',
	  codingScheme: 'ANZSIC',
	  displayName: 'Retail Pharmacy' },
   practiceSetting:	{ code: '4271-1',
	  codeSystem: 'ANZSIC',
	  displayName: 'Pharmacy, retail, operation' },
	name: "Strong Room",
	"medicarePharmacyApproval": {
		number: "8003628233372588",
		"duration": 1
	},
	wholeOrganisationName: {
		name: "StrongRoom AI",
		type: "ORGL"
	},
	electronicCommunincation: [{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	},{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	}],
	addresses: [
		{
			type: "Australian",
			use: "WP",
			country: "Australia",
			state: "NSW",
			city: "Sydney",
			postalCode: "5555",
			streetAddressLine:["1 Clinician Street"],
			additionalLocator:"Suite 2"
		}
	],
	hpio
};



let pathologyOrganisation = {
	privatePem,
	publicPem,
	ca,
	logo: {filename: "logo.jpg", buffer: fs.readFileSync("./sample/entities/organisations/examplepharmacylogo.jpg"), mediaType: "image/jpeg"},
	type: {displayName: "Pathology Lab", code: "PATH", originalText: "Pathology Lab"},
	healthcareFacilityType: { code: '8520',
		codingScheme: 'ANZSIC',
		displayName: 'Pathology and Diagnostic Imaging Services'
	},
	practiceSetting: { code: '8520-3',
		codeSystem: 'ANZSIC',
		displayName: 'Pathology laboratory service'
	},
	name: "Sample Pathology",
	wholeOrganisationName: {
		name: "Sample Pathology Laboratories Australia",
		type: "ORGL"
	},
	electronicCommunincation: [{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	},{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	}],
	addresses: [
		{
			type: "Australian",
			use: "WP",
			country: "Australia",
			state: "NSW",
			city: "Sydney",
			postalCode: "5555",
			streetAddressLine:["1 Clinician Street"],
			additionalLocator:"Suite 2"
		}
	],
	hpio
};

let diagnosticImagingOrganisation = {
	privatePem,
	publicPem,
	ca,
	logo: {filename: "logo.jpg", buffer: fs.readFileSync("./sample/entities/organisations/examplepharmacylogo.jpg"), mediaType: "image/jpeg"},
	type: {displayName: "Diganostic Imaging Facility", code: "DIAGIMG", originalText: "Diganostic Imaging Facility"},
	healthcareFacilityType: { code: '8520',
		codingScheme: 'ANZSIC',
		displayName: 'Pathology and Diagnostic Imaging Services'
	},
	practiceSetting: { code: '8520-1',
		codeSystem: 'ANZSIC',
		displayName: 'Diagnostic imaging service'
	},
	name: "Sample Radiology",
	wholeOrganisationName: {
		name: "Sample Radiology",
		type: "ORGL"
	},
	electronicCommunincation: [{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	},{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	}],
	addresses: [
		{
			type: "Australian",
			use: "WP",
			country: "Australia",
			state: "NSW",
			city: "Sydney",
			postalCode: "5555",
			streetAddressLine:["1 Clinician Street"],
			additionalLocator:"Suite 2"
		}
	],
	hpio
};


module.exports = {
	PHARMACY: [
		pharmacyOrganisation
	],
	PATHOLOGYLAB: [
		pathologyOrganisation
	],
	DIAGNOSTICIMAGINGPRACTICE: [
		diagnosticImagingOrganisation
	]
}
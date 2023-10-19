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

let concat = (set, value) => `${set} ${value}`;


let dataTypes = {
	XON: {
		0: "organizationName",
		1: "organizationNameTypeCode",
		2: "idNumber",
		3: "checkDigit",
		4: "checkDigitScheme",
		5: "assigningAuthority",
		6: "identifierTypeCode",
		7: "assigningFacility",
		8: "namerepresentationCode",
		9: "organizationIdentifier"
	},

	XCN: {
		0: "id",
		1: "familyName",
		2: "firstGivenName",
		3: "middleNameOrInital",
		4: "suffix",
		5: "prefix",
		6: "degree",
		7: "sourceTable",
		8: "assigningAuthority",
		9: "nameTypeCode",
		10: "identifierCheckDigit",
		11: "codeIdentifyingTheCheckDigitSchemeEmployed",
		12: "identifierTypeCode",
		13: "assigningFacility",
		14: "nameRepresentationCode",
		15: "Name Context",
		16: "Name Validity Range",
		17: "Name Assembly Order",
		18: "Effective Date",
		19: "Expiration Date",
		20: "Professional Suffix",
		21: "Assigning Jurisdiction",
		22: "Assigning Agency or Department",
		23: "Security Check",
		24: "Security Check Scheme"	
	}

}


let processDataType = function (dataType, hl7String){


	let hl7Object = {};
	let hl7Array = hl7String.split('^');
	hl7Object.hl7 = hl7String;

	Object.keys(dataTypes[dataType]).forEach(key => {
		if (hl7Array[key]){
			hl7Object[dataTypes[dataType][key]] = hl7Array[key];
		}
	});
	return hl7Object;
};

let createHl7DataType = function (dataType, subject){

	if (dataType==="XCN"){
		return `^${subject.name[0].family}^${subject.name[0].given ? subject.name[0].given.length > 0 ? subject.name[0].given[0] : "" : "" }^${subject.name[0].given ? subject.name[0].given.length > 1 ? subject.name[0].given.slice(1).reduce(concat).trim() : "" : "" }^${subject.name[0].suffix.reduce(concat).trim()}^${subject.name[0].prefix.reduce(concat).trim()}^^^&amp;1.2.36.1.2001.1003.0.${subject.hpii}&amp;ISO`;
	}else if (dataType==="XON"){
		return `${subject.name}^^^^^^^^^1.2.36.1.2001.1003.0.${subject.hpio}`;
	}

};





module.exports = {
	processDataType,
	createHl7DataType
}
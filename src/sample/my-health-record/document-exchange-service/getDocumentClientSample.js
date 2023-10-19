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

let product 		= require('./../../entities/product');
let user 			= require('./../../entities/user');
let organisation 	= require('./../../entities/provider-organisations.js').PHARMACY[0];
let patient 		= require('./../../entities/patients').FRANKHARDING;

let myHealthRecordClient = require('../../../my-health-record');

let sampleDocumentMetadata = {"creationTime":"20200611013225","serviceStartTime":"20200611013225","serviceStopTime":"20200611013225","sourcePatientId":"8003608666701594^^^&1.2.36.1.2001.1003.0&ISO","hash":"dafad74d81cdfabad2748fd66bd302ec8e21e66c","size":"5298","repositoryUniqueId":"1.2.36.1.2001.1007.10.8003640002000050","authorInstitution":{"hl7":"MEDTESTORGSB120^^^^^^^^^1.2.36.1.2001.1003.0.8003629900019338","organizationName":"MEDTESTORGSB120","organizationIdentifier":"1.2.36.1.2001.1003.0.8003629900019338"},"authorPerson":{"hl7":"^Jones^^^^Sir^^^&1.2.36.1.2001.1003.0.8003615833334118&ISO","familyName":"Jones","prefix":"Sir","assigningAuthority":"&1.2.36.1.2001.1003.0.8003615833334118&ISO"},"authorSpecialty":"General Medical Practitioner","class":{"code":"1.2.36.1.2001.1006.1.16473.14","codingScheme":"LOINC","displayName":"Event Summary"},"format":{"codingScheme":"PCEHR_FormatCodes","displayName":"Event Summary Report 3A"},"healthcareFacilityType":{"code":"8511","codingScheme":"ANZSIC","displayName":"General Practice"},"practiceSetting":{"code":"8511-3","codeSystem":"ANZSIC","displayName":"General practice medical clinic service"},"type":{"code":"34133-9","codingScheme":"LOINC","displayName":"Event Summary"},"patientId":"8003608666701594","documentId":"2.25.103280220734058367297828230300544270059"};

module.exports = function(result){
	//returns Promise
	return myHealthRecordClient.getDocument(
		{
			product,
			user,
			organisation
		},
		patient,
		sampleDocumentMetadata
	);
}
	
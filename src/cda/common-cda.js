let 	guid 	= require('uuid').v4;
let 	moment 	= require('moment');
const 	crypto	= require('crypto');


//todo: implement translations and recursive translations
let renderCode = code => {
	return `<${code.tag ? code.tag : "code"} ${code.type ? `xsi:type="${code.type}"` : ""} ${code.code ? `code="${code.code}"` : ""} ${code.codeSystem ? `codeSystem="${code.codeSystem}"` : ""}${code.codeSystemName ? ` codeSystemName="${code.codeSystemName}"` : ""}${code.displayName ? ` displayName="${code.displayName}"` : ""}${code.originalText ? `> <originalText>"${code.originalText}</originalText> </${code.tag ? code.tag : "code"}>` : " />"}`;
}

let renderCodeOpenTag = code => `<${code.tag ? code.tag : "code"} ${code.type ? `xsi:type="${code.type}"` : ""} ${code.code ? `code="${code.code}"` : ""} ${code.codeSystem ? `codeSystem="${code.codeSystem}"` : ""}${code.codeSystemName ? ` codeSystemName="${code.codeSystemName}"` : ""}${code.displayName ? ` displayName="${code.displayName}">` : ""}>`



let addLogo = documentDetails => {
	if (documentDetails.authorOrganisation.logo){
		return `  <component>
		<section>
		<entry>
			<observationMedia ID="LOGO" classCode="OBS" moodCode="EVN">
			<id root="${documentDetails.authorOrganisation.logo.id ? documentDetails.authorOrganisation.logo.id : guid()}" />
			<value mediaType="${documentDetails.authorOrganisation.logo.mediaType ? documentDetails.authorOrganisation.logo.mediaType : 'image/png'}" integrityCheckAlgorithm="SHA-1" integrityCheck="${crypto.createHash('sha1').update(documentDetails.authorOrganisation.logo.buffer).digest('base64')}">
				<reference value="${documentDetails.authorOrganisation.logo.filename}" />
			</value>
			</observationMedia>
		</entry>
		</section>
	</component>
	`;
	}else{
		return "";
	}
}

let renderCodedValue = value => renderCode({tag: 'value',type: 'CD', ...value});

let renderText = text => {
	if (typeof text === "string"){
		return `<text>${text}</text>`
	}else if (typeof text === "object"){
		if (text.nullFlavor){
			return `<text nullFlavor="${text.nullFlavor}" />`;
		}
	}
}

let renderId = id => {
	return `<id ${id.root ? `root="${id.root}"` : ""}
	${id.extension ? `extension="${id.extension}"` : ""}
	${id.assigningAuthorityName ? `assigningAuthorityName="${id.assigningAuthorityName}"` : ""}
/>`;

}

let renderCodeText = code => {
	if (code.originalText) {
		return code.originalText;
	}else if (code.displayName){
		return code.displayName;
	}else if (code.code){
		return code.code;
	}else{
		return "";
	}
}

let addMedicareCard = (patient, patientId) => {
	if (patient.medcareCard){
		return `<ext:coverage2 typeCode="COVBY">
		<ext:entitlement classCode="COV" moodCode="EVN">
		  <ext:id root="1.2.36.1.5001.1.0.7.1" extension="${patient.medicareCard.number}" assigningAuthorityName="Medicare Card Number" />
		  <ext:code code="1" codeSystem="1.2.36.1.2001.1001.101.104.16047" codeSystemName="NCTIS Entitlement Type Values" displayName="Medicare Benefits">
			<originalText>Medicare Benefits</originalText>
		  </ext:code>
		  <ext:effectiveTime>
		  ${patient.medicareCard.validFrom ? `<low value="${patient.medicareCard.validFrom}" />` : "" }
		  ${patient.medicareCard.validTo ? `<high value="${patient.medicareCard.validTo}" />` : "" }
		  </ext:effectiveTime>
		  <ext:participant typeCode="BEN">
			<ext:participantRole classCode="PAT">
			  <ext:id root="${patientId}" />
			</ext:participantRole>
		  </ext:participant>
		</ext:entitlement>
	  </ext:coverage2>
`;
	}else{
		return '';
	}
}

let addMedicarePharmacyApprovalNumberNarative = (organisation) => {
	if (organisation.medicarePharmacyApproval) {
		return `		<table>
		<caption>Dispensing Organisation Entitlement</caption>
		<thead>
		  <tr>
			<th>Entitlement Type</th>
			<th>Validity Duration</th>
			<th>Entitlement Number</th>
		  </tr>
		</thead>
		<tbody>
		  <tr>
			<td>Medicare Pharmacy Approval Number</td>
			<td>${organisation.medicarePharmacyApproval.duration} year${organisation.medicarePharmacyApproval.duration !== 1 ? 's' : ""}</td>
			<td>${organisation.medicarePharmacyApproval.number}  (AGIMO (Australian Government Information Management Office)) </td>
		  </tr>
		</tbody>
	  </table>`
	}else{
		return "";
	}
}


let addMedicarePharmacyApprovalNumber = (organisation) => {
	if (organisation.medicarePharmacyApproval){
		return `
			<ext:coverage2 typeCode="COVBY">
				<ext:entitlement classCode="COV" moodCode="EVN">
					<ext:id root="1.2.36.174030967.1.3.2.1" extension="${organisation.medicarePharmacyApproval.number}" assigningAuthorityName="AGIMO (Australian Government Information Management Office)" />
					<ext:code code="11" codeSystem="1.2.36.1.2001.1001.101.104.16047" codeSystemName="NCTIS Entitlement Type Values" displayName="Medicare Pharmacy Approval Number">
						<originalText>Medicare Pharmacy Approval Number</originalText>
					</ext:code>
					<ext:participant typeCode="HLD">
						<ext:participantRole classCode="SDLOC">
							<ext:id root="${organisation.uniqueId}" />
						</ext:participantRole>
					</ext:participant>
				</ext:entitlement>
			</ext:coverage2>`
	}else{
		return '';
	}
}




let renderAdministrativeGender = (genderCode) => {
	if (genderCode){
		if (genderCode.toUpperCase() === "M" || genderCode.toUpperCase("MALE")){
			return `<administrativeGenderCode code="M" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Male" />`;
		}else if (genderCode.toUpperCase() === "M" || genderCode.toUpperCase("MALE")){
			return `<administrativeGenderCode code="F" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Female" />`;
		}else if (	genderCode.toUpperCase() === "I" ||
					genderCode.toUpperCase("INTERSEX OR INDETERMINATE") || 
					genderCode.toUpperCase("INTERSEX") || 
					genderCode.toUpperCase("INDETERMINATE")){
			return `<administrativeGenderCode code="I" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Intersex or Indeterminate"/>`;
		}else if 	(	genderCode.toUpperCase() === "N" ||
						genderCode.toUpperCase("NOT STATED/INADEQUATELY DESCRIBED") ||
						genderCode.toUpperCase("NOT STATED") || 
						genderCode.toUpperCase("INADEQUATELY DESCRIBED")){
			return (`<administrativeGenderCode code="N" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Not Stated/Inadequately Described " />`)
		}else{
			return (`<administrativeGenderCode code="N" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Not Stated/Inadequately Described " />`);
		}
	}else{
		return (`<administrativeGenderCode code="N" codeSystem="2.16.840.1.113883.13.68" codeSystemName="AS 5017-2006 Health Care Client Identifier Sex" displayName="Not Stated/Inadequately Described " />`);
	}
}


let renderEthnicCode = (ethnicGroupCode) => {
	if (ethnicGroupCode){
		if (ethnicGroupCode === "Aboriginal but not Torres Strait Islander origin" 		||  ethnicGroupCode === 1 ) {
			return `<ethnicGroupCode code="1" codeSystem="2.16.840.1.113883.3.879.291036" codeSystemName="METeOR Indigenous Status" displayName="Aboriginal but not Torres Strait Islander origin" />`;
		}else if(ethnicGroupCode === "Torres Strait Islander but not Aboriginal origin" 		||  ethnicGroupCode === 2 ) {
			return `<ethnicGroupCode code="2" codeSystem="2.16.840.1.113883.3.879.291036" codeSystemName="METeOR Indigenous Status" displayName="Torres Strait Islander but not Aboriginal origin" />`;
		}else if(ethnicGroupCode === "Both Aboriginal and Torres Strait Islander origin" 		||  ethnicGroupCode === 3 ) {
			return `<ethnicGroupCode code="3" codeSystem="2.16.840.1.113883.3.879.291036" codeSystemName="METeOR Indigenous Status" displayName="Both Aboriginal and Torres Strait Islander origin" />`;
		}else if(ethnicGroupCode === "Neither Aboriginal nor Torres Strait Islander origin" 	||  ethnicGroupCode === 4 ) {
			return `<ethnicGroupCode code="4" codeSystem="2.16.840.1.113883.3.879.291036" codeSystemName="METeOR Indigenous Status" displayName="Neither Aboriginal nor Torres Strait Islander origin" />`;
		}else if(ethnicGroupCode === "Not stated/inadequately described" 						||  ethnicGroupCode === 9 ) {
			return `<ethnicGroupCode code="9" codeSystem="2.16.840.1.113883.3.879.291036" codeSystemName="METeOR Indigenous Status" displayName="Not stated/inadequately described" />` ;
		}else{
			return "";
		}
	}else{
		"";
	}
}


let renderTag = (value, tagName) => {
	if (value){
		if(typeof value === "string"){
			return `<${tagName}>${value}</${tagName}>`
		}else if(Array.isArray(value)){
			return value.map(value => `<${tagName}>${value}</${tagName}>`).reduce((set, value) => `${set}${value}`);
		}else{
			return "";
		}
	}else{
		return "";
	}
}

let processAddress = (address) => {
	return `<addr use="${address.use}">
		${address.country 			? 	`<country>${address.country}</country>` 			: ""}
		${address.state 			? 	`<state>${address.state}</state>` 					: ""}
		${address.city 				?	`<city>${address.city}</city>` 						: ""}
		${address.postalCode		?	`<postalCode>${address.postalCode}</postalCode>`	: ""}
		${renderTag(address.streetAddressLine, "streetAddressLine")}
		${address.additionalLocator ? `<additionalLocator>${address.additionalLocator}</additionalLocator>` : ""}
	</addr>`
}


let generatePatient = (patient) => {

return `<patientRole classCode="PAT">
	<id root="${patient.uniqueId}" />
	${patient.addresses.map(processAddress).reduce((set, value) => `${set}${value}`)}
	${patient.electronicCommunincation ? patient.electronicCommunincation.map(renderElectronicDetail).reduce((set, value) => `${set}${value}`) : ""}
	<patient>
		${patient.name.map(generateName).reduce((set, value) => `${set}${value}`)}
		${renderAdministrativeGender(patient.administrativeGender)}
		${patient.birthTime ? `<birthTime value="${moment(patient.birthTime).format("YYYYMMDDHHmmssZZ")}" />` : ""}
			${renderEthnicCode(patient.ethnicGroupCode)}
		${patient.multipleBirthInd 	?	`<ext:multipleBirthInd value="${patient.multipleBirthInd}" />`	: ""}
		${patient.deceasedInd 		?	`<ext:deceasedInd value="${patient.deceasedInd}" />` 			: ""}
		${patient.deceasedTime		?	`<ext:deceasedTime value="${patient.deceasedTime}" />`			: ""}
		${patient.birthplace 		?	`<birthplace><place>${processAddress(patient.birthplace)}</place></birthplace>` : "" }
		${patient.ihi				?	
	`<ext:asEntityIdentifier classCode="IDENT">
	<ext:id root="1.2.36.1.2001.1003.0.${patient.ihi}" assigningAuthorityName="IHI" />
	<ext:assigningGeographicArea classCode="PLC">
	  <ext:name>National Identifier</ext:name>
	</ext:assigningGeographicArea>
  </ext:asEntityIdentifier>
  `			: ""}
	</patient>
  </patientRole>`
}
let flattenName = nameObject => {

	let name = nameObject;
	if (Array.isArray(name)){
		if (name.length === 1){
			name = nameObject[0];
		}
	}

	let fullName = [];
	if (nameObject.prefix){
		nameObject.prefix.forEach (prefix => fullName.push(prefix))
	}
	if (nameObject.given){
		nameObject.given.forEach (given => fullName.push(given))
	}
	if (nameObject.family){
		fullName.push(nameObject.family)
	}
	if (nameObject.suffix){
		nameObject.suffix.forEach (suffix => fullName.push(suffix))
	}
	return fullName.join(" ");
}

let generateName = name => {
	
	return  `<name>
		${name.family ? `<family>${name.family}</family>` : ""}
		${name.given ?  (typeof name.given === "string" ?	`<given>${name.given}</given>` : "") : ""}
		${name.given ?  (Array.isArray(name.given) 		?	name.given.map(given => `<given>${given}</given>`).reduce((set, value) => `${set}${value}`) : "" )	: ""}
		${name.prefix ?  (typeof name.prefix === "string" ?	`<prefix>${name.prefix}</prefix>` : "") : ""}
		${name.prefix ?  (Array.isArray(name.prefix) 		?	name.prefix.map(prefix => `<prefix>${prefix}</prefix>`) : "" )	: ""}

		${name.suffix ?  (typeof name.suffix === "string" ?	`<suffix>${name.suffix}</suffix>` : "") : ""}
		${name.suffix ?  (Array.isArray(name.suffix) 		?	name.suffix.map(suffix => `<suffix>${suffix}</suffix>`) : "" )	: ""}
		
	</name>`
}

let renderElectronicDetail = detail => {
	if (detail.type==="email"){
		return `<telecom value="mailto:${detail.detail}" use="${detail.use}" />`;
	}else if (detail.type==="phone"){
		return `<telecom value="tel:${detail.detail}" use="${detail.use}" />`;
	}else{
		return "";
	}
}

let assignedPerson = (person) => {
	return `	<id root="${person.uniqueId ? person.uniqueId : guid()}" />
	<code code="${person.type.code}" codeSystem="2.16.840.1.113883.13.62" codeSystemName="1220.0 - ANZSCO - Australian and New Zealand Standard Classification of Occupations, First Edition, 2006" displayName="${person.type.displayName}" />
	${person.addresses.map(processAddress).reduce((set, value) => `${set}${value}`)}
	
	${person.electronicCommunincation ? person.electronicCommunincation.map(renderElectronicDetail).reduce((set, value) => `${set}${value}`) : ""}
		<assignedPerson>
		${ person.name.map(generateName).reduce((set, value) => `${set}${value}`)}
		<ext:asEntityIdentifier classCode="IDENT">
		${person.hpii ? `<ext:id root="1.2.36.1.2001.1003.0.${person.hpii}" assigningAuthorityName="HPI-I" /><ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea></ext:asEntityIdentifier>` : ""}
		${person.qualifications ? `<ext:asQualifications classCode="QUAL"><ext:code><originalText>${person.qualifications.map(qualification => qualification.originalText).reduce((set, value) => `${set} ${value}`).trim()}</originalText></ext:code></ext:asQualifications>` : "" }	
		</assignedPerson>`
}

let assignedPersonWithEmloyment = (person, orgnisation) => {
	return `	<id root="${person.uniqueId ? person.uniqueId : guid()}" />
	<code code="${person.type.code}" codeSystem="2.16.840.1.113883.13.62" codeSystemName="1220.0 - ANZSCO - Australian and New Zealand Standard Classification of Occupations, First Edition, 2006" displayName="${person.type.displayName}" />
	${person.addresses.map(processAddress).reduce((set, value) => `${set}${value}`)}
	
	${person.electronicCommunincation ? person.electronicCommunincation.map(renderElectronicDetail).reduce((set, value) => `${set}${value}`) : ""}
		<assignedPerson>
		${ person.name.map(generateName).reduce((set, value) => `${set}${value}`)}
		<ext:asEntityIdentifier classCode="IDENT">
			${person.hpii ? `<ext:id root="1.2.36.1.2001.1003.0.${person.hpii}" assigningAuthorityName="HPI-I" /><ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea>` : ""}
		</ext:asEntityIdentifier>

		<ext:asEmployment classCode="EMP">
			<ext:employerOrganization>
				<id root="${orgnisation.uniqueId}" />
				<asOrganizationPartOf>
					<wholeOrganization>
						<name>${orgnisation.name}</name>
						${orgnisation.hpio ? `<ext:asEntityIdentifier classCode="IDENT"><ext:id root="1.2.36.1.2001.1003.0.${orgnisation.hpio}" assigningAuthorityName="HPI-O" /><ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea></ext:asEntityIdentifier>` : "" }
					</wholeOrganization>
				</asOrganizationPartOf>
			</ext:employerOrganization>
		</ext:asEmployment>
		${person.qualifications ? `<ext:asQualifications classCode="QUAL"><ext:code><originalText>${person.qualifications.map(qualification => qualification.originalText).reduce((set, value) => `${set} ${value}`).trim()}</originalText></ext:code></ext:asQualifications>` : "" }	
		</assignedPerson>`
}


//todo the qualification for author is only rendering original text. Need to update it so it renders it like a normal code attribute (i.e. code system, displayname, code etc)
let generateAuthoringOrgnisation = (authoringOrgnisation, authorOrgID) => {
	
	//<code code="${authoringOrgnisation.type.code}" codeSystem="2.16.840.1.113883.1.11.17660" codeSystemName="HL7 ServiceDeliveryLocationRoleType" ${authoringOrgnisation.type.displayName ? `displayName="${authoringOrgnisation.type.displayName}" ` : "" }  />
	
	return `
	<healthCareFacility>
	<id root="${authoringOrgnisation.uniqueId}" />
	
	${renderCode(authoringOrgnisation.type)}
	<serviceProviderOrganization>
	  <id root="${guid()}" />
	  <name>${authoringOrgnisation.name}</name>
	  <asOrganizationPartOf>
		<wholeOrganization>
			<name use="${authoringOrgnisation.wholeOrganisationName.type}">${authoringOrgnisation.wholeOrganisationName.name}</name>
			${authoringOrgnisation.electronicCommunincation ? authoringOrgnisation.electronicCommunincation.map(renderElectronicDetail).reduce((set, value) => `${set}${value}`) : ""}
			${authoringOrgnisation.addresses.map(processAddress).reduce((set, value) => `${set}${value}`)}
			${authoringOrgnisation.hpio ? `<ext:asEntityIdentifier classCode="IDENT"><ext:id root="1.2.36.1.2001.1003.0.${authoringOrgnisation.hpio}" assigningAuthorityName="HPI-O" /><ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea></ext:asEntityIdentifier>` : "" }
		</wholeOrganization>
	  </asOrganizationPartOf>
	</serviceProviderOrganization>
  </healthCareFacility>	`;
}



module.exports = {
	addMedicarePharmacyApprovalNumber,
	addMedicarePharmacyApprovalNumberNarative,
	addMedicareCard,
	renderCodeText,
	renderCode,
	renderCodedValue,
	renderAdministrativeGender,
	renderEthnicCode,
	renderTag,
	processAddress,
	generatePatient,
	generateName,
	renderElectronicDetail,
	assignedPerson,
	generateAuthoringOrgnisation,
	renderId,
	renderText,
	assignedPersonWithEmloyment,
	renderCodeOpenTag,
	addLogo,
	flattenName
};
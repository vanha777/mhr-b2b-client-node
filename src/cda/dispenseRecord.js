let 	guid	= require('uuid').v4;
let 	moment	= require('moment');
let 	cda		= require('./common-cda');
const 	crypto	= require('crypto');
const	chalk	= require('chalk');


const addMedicarePharmacyApprovalNumber				= cda.addMedicarePharmacyApprovalNumber;
const addMedicarePharmacyApprovalNumberNarative		= cda.addMedicarePharmacyApprovalNumberNarative;
const addMedicareCard								= cda.addMedicareCard;
const renderCodeText								= cda.renderCodeText;
const renderCode									= cda.renderCode;
const renderAdministrativeGender 					= cda.renderAdministrativeGender;
const renderEthnicCode 								= cda.renderEthnicCode;
const renderTag 									= cda.renderTag;
const processAddress 								= cda.processAddress;
const generatePatient 								= cda.generatePatient;
const generateName 									= cda.generateName;
const renderElectronicDetail						= cda.renderElectronicDetail;
const assignedPerson								= cda.assignedPerson;
const generateAuthoringOrgnisation					= cda.generateAuthoringOrgnisation;
const renderId										= cda.renderId;
const renderText									= cda.renderText;

//todo dynamcially create the ID
//todo representedCustodianOrganization set this properly. Including name.
let dispenseRecord = (dispense) => {
	let dispenseDefaults = {
		patient:{uniqueId: guid()},
		authorOrganisation:{uniqueId: guid()},
		authorIndividual:{uniqueId: guid()},
	};

	let dispenseDetails = {
		patient: 			{...dispenseDefaults.patient,...dispense.patient},
		authorIndividual: 	{...dispenseDefaults.authorIndividual, ...dispense.authorIndividual},
		authorOrganisation: {...dispenseDefaults.authorOrganisation,...dispense.authorOrganisation},
		dispense: 			dispense.dispense,
		metadata: 			dispense.metadata
	};

	let attachments = dispense.dispense.attachments ? dispense.dispense.attachments : [];

	if (dispenseDetails.authorOrganisation.logo){
		if (!attachments.includes(dispenseDetails.authorOrganisation.logo)){
			attachments.push(dispenseDetails.authorOrganisation.logo);
		}
	}

	return {
		attachments,
		'xml': `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
	<ClinicalDocument xmlns:ext="http://ns.electronichealth.net.au/Ci/Cda/Extensions/3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:hl7-org:v3">
	<typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040" />
	<templateId root="1.2.36.1.2001.1001.100.1002.171" extension="1.0" />
	<templateId root="1.2.36.1.2001.1001.100.149" extension="1.0" />
		<id root="${dispenseDetails.dispense.id}" />
		<code code="100.16765" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="PCEHR Dispense Record" />
		<title>Medication Dispensed</title>
		<effectiveTime value="${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmssZZ")}" />
		<confidentialityCode nullFlavor="NA" />
		<languageCode code="en-AU" />
		${dispenseDetails.metadata.setId ? `<setId root="${dispenseDetails.metadata.setId}" />` : "" }
		${dispenseDetails.metadata.version ? `<versionNumber value="${dispenseDetails.metadata.version}" />` : "" }
	<recordTarget typeCode="RCT">
		${generatePatient(dispenseDetails.patient)}
	</recordTarget>
	<author typeCode="AUT">
		<time value="${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmssZZ")}" />
		<assignedAuthor>
			${assignedPerson(dispenseDetails.authorIndividual)}
		</assignedAuthor>
		</author>
	<custodian>
		<assignedCustodian>
		<representedCustodianOrganization>
			<id root="${dispenseDetails.authorOrganisation.uniqueId}" />
			<name>${dispenseDetails.authorOrganisation.name}</name>
			<ext:asEntityIdentifier classCode="IDENT">
			<ext:id root="1.2.36.1.2001.1003.0.${dispenseDetails.authorOrganisation.hpio}" assigningAuthorityName="HPI-O" />
			<ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea>
			</ext:asEntityIdentifier>
		</representedCustodianOrganization>
		</assignedCustodian>
	</custodian>
	<legalAuthenticator>
	<time value="${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmssZZ")}" />
	<signatureCode code="S" />
	<assignedEntity>
	${assignedPerson(dispenseDetails.authorIndividual ? dispenseDetails.authorIndividual : dispenseDetails.legalAuthenticator )}
	</assignedEntity>
	</legalAuthenticator>
	${dispenseDetails.dispense.relatedDocuments ? dispenseDetails.dispense.relatedDocuments.map(relatedDocument => `<relatedDocument typeCode="${relatedDocument.typeCode}"><parentDocument>${renderId(relatedDocument.id)}${renderText(relatedDocument.text)}</parentDocument></relatedDocument>`).reduce((set, value) => `${set}${value}`)	: ""  }
	<componentOf>
		<encompassingEncounter>
		<effectiveTime nullFlavor="NA" />
		<location>${generateAuthoringOrgnisation(dispenseDetails.authorOrganisation)}</location>
		</encompassingEncounter>
	</componentOf>
	<component>
	<structuredBody>
	<component>
		<section>
		<code code="102.16210" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Dispense Item">
			<originalText>Dispense Item</originalText>
		</code>
		<title>Dispense Item</title>
		<text mediaType="text/x-hl7-text+xml">
			<table>
			<caption>Dispense Item</caption>
			<thead>
				<tr><th>Field</th><th>Value</th></tr>
			</thead>
			<tbody>
				<tr>
				<td>Therapeutic Good Identification</td>
				<td>${renderCodeText(dispenseDetails.dispense.therapeuticGoodIdentification)}</td>
				</tr>
				<tr>
				<td>Therapeutic Good Strength</td>
				<td>${dispenseDetails.dispense.therapeuticGoodStrength.text}</td>
				</tr>
				${dispenseDetails.dispense.therapeuticGoodGeneric ?
					`	${dispenseDetails.dispense.therapeuticGoodGeneric.name 				? `<tr><td>Therapeutic Good Generic Name</td><td>${dispenseDetails.dispense.therapeuticGoodGeneric.name}</td></tr>` : ""}
						${dispenseDetails.dispense.therapeuticGoodGeneric.descripiton		? `<tr><td>Additional Dispensed Item Description</td><td>${dispenseDetails.dispense.therapeuticGoodGeneric.description}</td></tr>` : ""}` : "" }
				<tr>
					<td>Label Instruction</td>
					<td>${dispenseDetails.dispense.labelInstruction}</td>
				</tr>
				<tr>
				<td>Formula</td>
				<td>${dispenseDetails.dispense.formula}</td>
				</tr>
				<tr>
				<td>Form</td>
				<td>${renderCodeText(dispenseDetails.dispense.form)} </td>
				</tr>
				<tr>
				<td>Quantity Description</td>
				<td>${dispenseDetails.dispense.quantity}</td>
				</tr>
				${dispenseDetails.dispense.comment ? `<tr><td>Comment</td><td>${dispenseDetails.dispense.comment.text}</td></tr>` : ""}
				<tr><td>Brand Substitution Occurred</td><td>${dispenseDetails.dispense.brandSubstitutionOccurred}</td></tr>
				<tr>
				<td>Number of this Dispense</td>
				<td>${dispenseDetails.dispense.numberOfThisDispense}</td>
				</tr>
				<tr>
				<td>Maximum Number of Repeats</td>
				<td>${dispenseDetails.dispense.numberOfRepeats}</td>
				</tr>
				${dispenseDetails.dispense.pbsManufacturerCode ? `<tr><td>PBS Manufacturer Code</td><td>${dispenseDetails.dispense.pbsManufacturerCode} (Australian PBS Manufacturer Code)</td></tr>` : ""}
				<tr>
				<td>Unique Pharmacy Prescription Number</td>
				<td>${dispenseDetails.dispense.uniquePharmacyPrescriptionNumber}</td>
				</tr>
				<tr>
				<td>Prescription Item Identifier</td>
				<td>${dispenseDetails.dispense.prescriptionItemIdentifier.extension}  ${dispenseDetails.dispense.prescriptionItemIdentifier.assigningAuthorityName} </td>
				</tr>
				<tr>
				<td>DateTime of Dispense Event</td>
				<td>${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).format("Do MMMM YYYY, hh:mm:ss a")}</td>
				</tr>
				<tr>
					<td>Dispense Item Identifier</td>
					<td>${dispenseDetails.dispense.dispenseItemIdentifier.extension}</td>
				</tr>
			</tbody>
			</table>
			${addMedicarePharmacyApprovalNumberNarative(dispenseDetails)}
		</text>
		<entry>
			<substanceAdministration classCode="SBADM" moodCode="RQO">
				${renderId(dispenseDetails.dispense.prescriptionItemIdentifier)}
			<statusCode code="${dispenseDetails.dispense.numberOfRepeats > dispenseDetails.dispense.numberOfThisDispense ? "active" : "completed" }" />
			<repeatNumber>
				<high value="${dispenseDetails.dispense.numberOfRepeats}" />
			</repeatNumber>
			<consumable>
				<manufacturedProduct>
				<manufacturedMaterial />
				</manufacturedProduct>
			</consumable>
			<entryRelationship typeCode="COMP">
				<sequenceNumber value="${dispenseDetails.dispense.numberOfThisDispense}" />
				<supply classCode="SPLY" moodCode="EVN">
					${renderId(dispenseDetails.dispense.dispenseItemIdentifier)}
				<effectiveTime value="${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).format("YYYYMMDDHHmmssZZ")}" />
				<independentInd value="false" />
				<product>
					<manufacturedProduct>
					<manufacturedMaterial>
						${renderCode(dispenseDetails.dispense.therapeuticGoodIdentification)}
						${dispenseDetails.dispense.therapeuticGoodGeneric ?
							`${dispenseDetails.dispense.therapeuticGoodGeneric.name 		? `<name>${dispenseDetails.dispense.therapeuticGoodGeneric.name}</name>` : ""}
							${dispenseDetails.dispense.therapeuticGoodGeneric.descripiton	? `<ext:desc>${dispenseDetails.dispense.therapeuticGoodGeneric.description}</ext:desc>` : ""} ` : "" }
						${renderCode({...dispenseDetails.dispense.form, tag: "ext:formCode"})}
					</manufacturedMaterial>
						${dispenseDetails.dispense.pbsManufacturerCode ? `<manufacturerOrganization><id root="1.2.36.1.2001.1005.23" extension="${dispenseDetails.dispense.pbsManufacturerCode}" assigningAuthorityName="Australian PBS Manufacturer Code" /></manufacturerOrganization>` : ""}
					</manufacturedProduct>
				</product>
				<entryRelationship typeCode="COMP">
					<act classCode="INFRM" moodCode="EVN">
					<id root="${guid()}" />
					<code code="246205007" codeSystem="2.16.840.1.113883.6.96" codeSystemName="SNOMED CT-AU" displayName="Quantity" />
					<text>${dispenseDetails.dispense.quantity}</text>
					</act>
				</entryRelationship>
				<entryRelationship typeCode="COMP">
					<act classCode="ACT" moodCode="EVN">
					<id root="${dispenseDetails.dispense.uniquePharmacyPrescriptionNumber}" />
					<code code="103.16786" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Unique Pharmacy Prescription Number" />
					<text>${dispenseDetails.dispense.uniquePharmacyPrescriptionNumber}</text>
					</act>
				</entryRelationship>
				<entryRelationship typeCode="COMP">
					<act classCode="INFRM" moodCode="EVN">
					<!-- <id root="${guid()}" /> -->
					<code code="103.16109" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Label Instruction" />
					<text xsi:type="ST">${dispenseDetails.dispense.labelInstruction}</text>
					</act>
				</entryRelationship>
				<entryRelationship typeCode="COMP">
					<observation classCode="OBS" moodCode="EVN">
					<id root="${guid()}" />
					<code code="103.16064" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Brand Substitution Occurred" />
					<value xsi:type="BL" value="${dispenseDetails.dispense.brandSubstitutionOccurred}" />
					</observation>
				</entryRelationship>
				</supply>
			</entryRelationship>
				${dispenseDetails.dispense.comment ? `<entryRelationship typeCode="COMP"><act classCode="INFRM" moodCode="EVN">${renderId(dispenseDetails.dispense.comment.id)}<code code="103.16044" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Additional Comments" />${renderText(dispenseDetails.dispense.comment.text)}</act>` : "" }
			</entryRelationship>
			<entryRelationship typeCode="COMP">
				<act classCode="INFRM" moodCode="EVN">
				<id root="${guid()}" />
				<code code="103.16272" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Formula" />
				<text>${dispenseDetails.dispense.formula}</text>
				</act>
			</entryRelationship>
			${dispenseDetails.dispense.therapeuticGoodStrength ? `<entryRelationship typeCode="COMP"><act classCode="INFRM" moodCode="EVN">${renderId(dispenseDetails.dispense.therapeuticGoodStrength.id)}<code code="103.16769.171.1.1" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Therapeutic Good Strength" />${renderText(dispenseDetails.dispense.therapeuticGoodStrength.text)}</act></entryRelationship>` : ""}
			</substanceAdministration>
		</entry>
		${addMedicareCard(dispenseDetails.patient)}
		${addMedicarePharmacyApprovalNumber(dispenseDetails.authorOrganisation)}
		</section>
	</component>
	<component>
		<section>
		<id root="${guid()}" />
		<code code="102.16080" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Administrative Observations" />
		<title>Administrative Observations</title>
		<text mediaType="text/x-hl7-text+xml">
			<table>
			<caption>Demographic Data</caption>
			<thead>
				<tr><th>Field</th><th>Value</th></tr>
			</thead>
			<tbody>
				<tr>
				<td>Age</td>
				<td>${moment(dispenseDetails.dispense.dateTimeOfDispenseEvent).diff(dispenseDetails.patient.birthTime, "years")} Years old</td>
				</tr>
				</tbody>
			</table>
		</text>
		</section>
	</component>
	${dispenseDetails.authorOrganisation.logo ? `
	<component>
		<section>
		<entry>
			<observationMedia ID="LOGO" classCode="OBS" moodCode="EVN">
			<id root="${guid()}" />
			<value mediaType="${dispenseDetails.authorOrganisation.logo.mediaType ? dispenseDetails.authorOrganisation.logo.mediaType : 'image/png'}" integrityCheckAlgorithm="SHA-1" integrityCheck="${crypto.createHash('sha1').update(dispenseDetails.authorOrganisation.logo.buffer).digest('base64')}">
				<reference value="${dispenseDetails.authorOrganisation.logo.filename}" />
			</value>
			</observationMedia>
		</entry>
	</section>
</component>
` : ""}
</structuredBody>
</component>
</ClinicalDocument>

	`
	};
}
module.exports = dispenseRecord;
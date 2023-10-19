let 	guid	= require('uuid').v4;
let 	moment	= require('moment');
let 	cda		= require('./common-cda');
const 	crypto	= require('crypto');
const	chalk	= require('chalk');
const 	pathologyPdf = require('../pdf/pathology');

const addMedicarePharmacyApprovalNumber				= cda.addMedicarePharmacyApprovalNumber;
const addMedicarePharmacyApprovalNumberNarative		= cda.addMedicarePharmacyApprovalNumberNarative;
const addMedicareCard								= cda.addMedicareCard;
const renderCodeText								= cda.renderCodeText;
const renderCode									= cda.renderCode;
const renderCodedValue								= cda.renderCodedValue;
const renderAdministrativeGender 					= cda.renderAdministrativeGender;
const renderEthnicCode 								= cda.renderEthnicCode;
const renderTag 									= cda.renderTag;
const processAddress 								= cda.processAddress;
const generatePatient 								= cda.generatePatient;
const generateName 									= cda.generateName;
const renderElectronicDetail						= cda.renderElectronicDetail;
const assignedPerson								= cda.assignedPerson;
const assignedPersonWithEmloyment					= cda.assignedPersonWithEmloyment;
const generateAuthoringOrgnisation					= cda.generateAuthoringOrgnisation;
const renderId										= cda.renderId;
const renderText									= cda.renderText;
const addLogo										= cda.addLogo;

const flattenName									= cda.flattenName;
const	mapPathologyToCommonObjectMap 	= require('./pathology-common-object-mapping');




let generatePathologyTestComponent = test => {

	return `
	<component>
		<section>
		  <id root="${guid()}" />
		  <code code="102.16144" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Pathology Test Result" />
		  <title>Pathology Test Result</title>
		  <text mediaType="text/x-hl7-text+xml">
			<table>
			  <caption>Pathology Test Result</caption>
			  <thead>
				<tr>
				  <th>Collection Date</th>
				  <th>Observation Date</th>
				  <th>Test Result Name</th>
				  <th>Diagnostic Service</th>
				  <th>Status</th>
				</tr>
			  </thead>
			  <tbody>
				<tr>
				<td >${moment(test.collectionDate).format("Do MMMM YYYY, hh:mm:ss a")}</td>
				<td >${moment(test.observationDate).format("Do MMMM YYYY, hh:mm:ss a")}</td>
				<td>${renderCodeText(test.code)}</td>
				<td>${renderCodeText(test.discipline)}</td>
				<td>${renderCodeText(test.status)}</td>
				</tr>
			  </tbody>
			</table>
		  </text>
		  <entry>
			<observation classCode="OBS" moodCode="EVN">
			  <id root="${test.id ? test.id.root : guid()}" ${test.extension ? `extension="${test.extension}"` : ""} />
			  ${renderCode(test.code)}
			  <entryRelationship typeCode="COMP">
				<observation classCode="OBS" moodCode="EVN">
				<id root="${test.discipline.id ? test.discipline.id.root : guid()}" ${test.discipline.extension ? `extension="${test.discipline.extension}"` : ""} />
				  <code code="310074003" codeSystem="2.16.840.1.113883.6.96" codeSystemName="SNOMED CT-AU" displayName="pathology service" />
				  ${renderCodedValue(test.discipline)}
				</observation>
			  </entryRelationship>
			  <entryRelationship typeCode="COMP">
				<observation classCode="OBS" moodCode="EVN">
				<id root="${test.status.id ? test.status.id.root : guid()}" ${test.status.extension ? `extension="${test.status.extension}"` : ""} />
				  <code code="308552006" codeSystem="2.16.840.1.113883.6.96" codeSystemName="SNOMED CT-AU" displayName="report status" />
				  ${renderCodedValue(test.status)}
				</observation>
			  </entryRelationship>
			  <entryRelationship typeCode="SUBJ">
				<observation classCode="OBS" moodCode="EVN">
				<id root="${test.collectionDate.id ? test.collectionDate.id.root : guid()}" ${test.collectionDate.extension ? `extension="${test.collectionDate.extension}"` : ""} />
				  <code code="102.16156" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Specimen" />
				  <effectiveTime value="${moment(test.collectionDate).format("YYYYMMDDHHmmssZZ")}" />
				</observation>
			  </entryRelationship>
			  <entryRelationship typeCode="COMP">
				<observation classCode="OBS" moodCode="EVN">
				<id root="${test.status.id ? test.status.id.root : guid()}" ${test.status.extension ? `extension="${test.status.extension}"` : ""} />
				  <code code="103.16605" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Pathology Test Result DateTime" />
				  <effectiveTime value="${moment(test.observationDate).format("YYYYMMDDHHmmssZZ")}" />
				</observation>
			  </entryRelationship>
			</observation>
		  </entry>
		</section>
	  </component>`

}

let createPathologyComponent = documentDetails => {
return `<component>
<structuredBody>
  <component>
	<section>
	<id root="${guid()}" />
	<code code="101.20018" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Pathology" />
	  <title>Pathology</title>
	  <text mediaType="text/x-hl7-text+xml">
		<table>
		  <thead><tr><th>Report DateTime</th><th>Report Name</th><th>Reporting Pathologist</th><th>Report Status</th></tr></thead>
		  <tbody>
			<tr>
			  <td>${moment(documentDetails.report.date).format("Do MMMM YYYY, hh:mm:ss a")}</td>
			  <td>
				<content><linkHtml href="${documentDetails.report.reportPdf.filename}" ID="_${guid()}">${documentDetails.report.name}</linkHtml></content>
			  </td>
			  <td>
				${documentDetails.authorIndividual.name.map(name => `<content>${flattenName(name)}</content>`).join("<br />") }
				<content><br />(${documentDetails.authorOrganisation.name})</content>
			  </td>
			  <td>${renderCodeText(documentDetails.report.documentStatus)}</td>
			</tr>
		  </tbody>
		</table>
	  </text>

	  <author typeCode="AUT">
		<time value="${moment(documentDetails.commonElements.authorTime).format("YYYYMMDDHHmmssZZ")}" />
			<assignedAuthor>
				${documentDetails.config.authorOrganisationDetailsAssignedToAuthorPerson ? assignedPersonWithEmloyment(documentDetails.authorIndividual, documentDetails.authorOrganisation) : assignedPerson(documentDetails.authorIndividual)}
			</assignedAuthor>
		</author>
	  <entry>
		<act classCode="ACT" moodCode="EVN">
		<id root="${documentDetails.report.id ? documentDetails.report.id : guid()}" />
		<code code="102.16971" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Related Document" />
			<effectiveTime>
				<low value="${moment(documentDetails.report.date).format("YYYYMMDDHHmmssZZ")}" />
			</effectiveTime>
			<entryRelationship typeCode="COMP">
			<act classCode="ACT" moodCode="EVN">
				<code code="103.16966" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Document Title" />
				<text xsi:type="ST">${documentDetails.report.name}</text>
			</act>
		</entryRelationship>
		  <entryRelationship typeCode="COMP">
			<observation classCode="OBS" moodCode="EVN">
				<id root="${documentDetails.report.documentStatus.id ? documentDetails.report.documentStatus.id : guid()}" />
				<code code="103.20104" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Document Status" />
				${renderCodedValue(documentDetails.report.documentStatus)}
			</observation>
		  </entryRelationship>
		  <reference typeCode="XCRPT">
			<seperatableInd value="true" />
			<externalDocument>
			<id root="${documentDetails.report.reportPdf.id ? documentDetails.report.reportPdf.id : guid()}" />
			<code code="11526-1" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Pathology study" />
			  <text mediaType="${documentDetails.report.reportPdf.mediaType ? documentDetails.report.reportPdf.mediaType : 'application/pdf'}" integrityCheck="${crypto.createHash('sha1').update(documentDetails.report.reportPdf.buffer).digest('base64')}">
			  	<reference value="${documentDetails.report.reportPdf.filename}" />
			  </text>
			</externalDocument>
		  </reference>
		</act>
		</entry>
		${documentDetails.report.tests.map(generatePathologyTestComponent).join('\n')}
	
	</section>
  </component>
  <component>
	<section>
	  <id root="${guid()}" />
	  <code code="102.16080" codeSystem="1.2.36.1.2001.1001.101" codeSystemName="NCTIS Data Components" displayName="Administrative Observations" />
	  <title>Administrative Observations</title>
	  <text mediaType="text/x-hl7-text+xml">
		<paragraph>This section contains no entries.</paragraph>
	  </text>
	</section>
  </component>

  ${addLogo(documentDetails)}
</structuredBody>
</component>`;
	
}

//todo dynamcially create the ID
//todo representedCustodianOrganization set this properly. Including name.
let pathologyReport = (documentObject) => {
	const documentDetails = mapPathologyToCommonObjectMap(documentObject);

	if (!documentDetails.report.reportPdf){
		throw new Error("No PDF attached");
	}

	return {
		attachments: documentDetails.attachments,
		'xml': `<?xml version="1.0" encoding="utf-8" standalone="yes"?>
	<ClinicalDocument xmlns:ext="http://ns.electronichealth.net.au/Ci/Cda/Extensions/3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="urn:hl7-org:v3">
	<typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040" />

	${documentDetails.commonElements.templatesIds.map(templateId=> `<templateId root="${templateId.root}" extension="${templateId.extension}" />`).join('')}
		<id root="${documentDetails.commonElements.id}" />
		${renderCode(documentDetails.config.documentCode)}
		<title>${documentDetails.commonElements.title}</title>
		<effectiveTime value="${moment(documentDetails.effectiveTime).format("YYYYMMDDHHmmssZZ")}" />
		<confidentialityCode nullFlavor="NA" />
		<languageCode code="en-AU" />
		${documentDetails.metadata.setId ? `<setId root="${documentDetails.metadata.setId}" />` : "" }
		${documentDetails.metadata.version ? `<versionNumber value="${documentDetails.metadata.version}" />` : "" }
		${renderCode({...documentDetails.report.completionCode, "tag": "ext:completionCode"})}
	<recordTarget typeCode="RCT">
		${generatePatient(documentDetails.patient)}
	</recordTarget>
	<author typeCode="AUT">
		<time value="${moment(documentDetails.commonElements.authorTime).format("YYYYMMDDHHmmssZZ")}" />
			<assignedAuthor>
				${documentDetails.config.authorOrganisationDetailsAssignedToAuthorPerson ? assignedPersonWithEmloyment(documentDetails.authorIndividual, documentDetails.authorOrganisation) : assignedPerson(documentDetails.authorIndividual)}
			</assignedAuthor>
		</author>
	<custodian>
		<assignedCustodian>
		<representedCustodianOrganization>
			<id root="${documentDetails.authorOrganisation.uniqueId}" />
			<name>${documentDetails.authorOrganisation.name}</name>
			<ext:asEntityIdentifier classCode="IDENT">
			<ext:id root="1.2.36.1.2001.1003.0.${documentDetails.authorOrganisation.hpio}" assigningAuthorityName="HPI-O" />
			<ext:assigningGeographicArea classCode="PLC"><ext:name>National Identifier</ext:name></ext:assigningGeographicArea>
			</ext:asEntityIdentifier>
		</representedCustodianOrganization>
		</assignedCustodian>
	</custodian>
	<legalAuthenticator>
	<time value="${moment(documentDetails.commonElements.authorTime).format("YYYYMMDDHHmmssZZ")}" />
	<signatureCode code="S" />
	<assignedEntity>
	${assignedPerson(documentDetails.authorIndividual ? documentDetails.authorIndividual : documentDetails.legalAuthenticator )}
	</assignedEntity>
	</legalAuthenticator>

	<participant typeCode="REF">
	<time value="${moment(documentDetails.referrerDateTime).format("YYYYMMDDHHmmssZZ")}" />
	<associatedEntity classCode="ASSIGNED">
	<id root="${guid()}" />

	${renderCode(documentDetails.referrer.type)}
	
	<associatedPerson>
	${documentDetails.referrer.name.map(generateName).join('')}
		
	<!--<ext:asEmployment nullFlavor="NI" classCode="EMP" /> -->
	</associatedPerson>
	</associatedEntity>
	</participant>
	${documentDetails.commonElements.relatedDocuments ? documentDetails.commonElements.relatedDocuments.map(relatedDocument => `<relatedDocument typeCode="${relatedDocument.typeCode}"><parentDocument>${renderId(relatedDocument.id)}${renderText(relatedDocument.text)}</parentDocument></relatedDocument>`).reduce((set, value) => `${set}${value}`)	: ""  }
	
	${documentDetails.config.authorOrganisationStoredAsEncompassingEncounter && (documentDetails.authorOrganisation) ? `<componentOf>
	<encompassingEncounter>
	<effectiveTime nullFlavor="NA" />
	<location>${generateAuthoringOrgnisation(documentDetails.authorOrganisation)}</location>
	</encompassingEncounter>
</componentOf>` : ""}
${createPathologyComponent(documentDetails)}
</ClinicalDocument>`
	};
}



let pathologyReportPromise = (documentObject) => {
	return new Promise((resolve, reject) => {
		if (documentObject.report.reportPdf){
			let pathReport = pathologyReport(documentObject)
			 resolve({
				 ...documentObject,
				 xml: pathReport.xml,
				 attachments: pathReport.attachments
			 })
		}else{
			pathologyPdf(documentObject).then(pdf => {
				documentObject.report.reportPdf = {filename: "pathology_report.pdf", buffer: pdf, mediaType: "application/pdf"};
				let pathReport = pathologyReport(documentObject)

				resolve({
					...documentObject,
					xml: pathReport.xml,
					attachments: pathReport.attachments
   
				})
   

			}).catch(error => reject(error))
			


		}
	});


}

module.exports = {
	sync: 		pathologyReport,
	promise: 	pathologyReportPromise
};
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
const { signRequest, executeRequest, buildUnsignedB2BRequest, buildHeader } = require('./soap');
const libxmljs = require("libxmljs");
const namespaces = require('./namespaces');
const moment = require('moment');
let guid = require('uuid').v4;
const JSZip = require('jszip');
const fs = require('fs');

let processMimeMultipart = require('./mime-multipart').getAttachment;
let xop = require('./mime-multipart').xop;
let uploadDocumentMtom = require('./mime-multipart').uploadDocumentMtom;


let processHL7DataType = require('./hl7').processDataType;

const chalk = require('chalk');
// const fs = require('fs').promises;
const Busboy = require('busboy');


//todo: support other filter types such as serviceStartDate and XDSDocumentEntryStatus i.e. approved, etc
let getDocumentList = ({ product, user, organisation }, patient, options) => {

	let documentTypeFilter = "";

	let serviceStopTimeToFilter = options.serviceStopTimeTo ? `
	<Slot name="$XDSDocumentEntryServiceStopTimeTo">
		<ValueList>
			<Value>${typeof options.serviceStopTimeTo === "string" ? options.serviceStopTimeTo : moment(options.serviceStopTimeTo).format("YYYYMMDD")}235959</Value>
		</ValueList>
	</Slot>` : "";

	let serviceStopTimeFromFilter = options.serviceStopTimeFrom ? `
	<Slot name="$XDSDocumentEntryServiceStopTimeFrom">
		<ValueList>
			<Value>${typeof options.serviceStopTimeFrom === "string" ? options.serviceStopTimeFrom : moment(options.serviceStopTimeFrom).format("YYYYMMDD")}000000</Value>
		</ValueList>
	</Slot>` : "";

	if (options.documentTypes && options.documentTypes.length > 0) {
		documentTypeFilter = `
			<Slot name="$XDSDocumentEntryClassCode">
				<ValueList>
					${options.documentTypes.map(documentType => `<Value>('${documentType}')</Value>`).join('')}
				</ValueList>
			</Slot>
		`;
	}

	return new Promise((resolve, reject) => {
		try {
			executeRequest(organisation, "getDocumentList",
				signRequest(
					buildUnsignedB2BRequest(
						buildHeader(product, user, organisation, patient, "urn:ihe:iti:2007:RegistryStoredQuery"),
						`	<AdhocQueryRequest xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:query:3.0">
							<ResponseOption returnComposedObjects="true" returnType="LeafClass"/>
							<AdhocQuery id="urn:uuid:14d4debf-8f97-4251-9a74-a90016b0af0d" xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0">
								<Slot name="$XDSDocumentEntryPatientId">
									<ValueList>
										<Value>'${patient.ihi}^^^&amp;1.2.36.1.2001.1003.0&amp;ISO'</Value>
									</ValueList>
								</Slot>
								<Slot name="$XDSDocumentEntryStatus">
									<ValueList>
										<Value>('urn:oasis:names:tc:ebxml-regrep:StatusType:Approved')</Value>
									</ValueList>
								</Slot>
								${documentTypeFilter}
								${serviceStopTimeFromFilter}
								${serviceStopTimeToFilter}
							</AdhocQuery>
						</AdhocQueryRequest">
					`
					),
					organisation
				),
				(error, response, body) => {
					//DEBUG
					let xmlDoc = libxmljs.parseXml(body);
					if (xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='AdhocQueryResponse']").getAttribute('status').value() === "urn:oasis:names:tc:ebxml-regrep:ResponseStatusType:Failure") {
						resolve({
							response: {
								code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='AdhocQueryResponse']/*[local-name()='RegistryErrorList']/*[local-name()='RegistryError']").getAttribute('errorCode').value(),
								message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='AdhocQueryResponse']/*[local-name()='RegistryErrorList']/*[local-name()='RegistryError']").getAttribute('codeContext').value(),
							},
						})
					}
					console.log("Request: \n", response.request.body);
					console.log("Response: \n", body);

					//end.
					if (error) {
						reject(error);
					} else {
						let xmlDoc = libxmljs.parseXml(body, { preserveWhitespace: true });

						resolve(
							xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='AdhocQueryResponse']/*[local-name()='RegistryObjectList']")
								.childNodes().map(node => {
									if (node.type() === "element") {
										if (node.name() === "ExtrinsicObject") {
											return node.childNodes().reduce((document, currentNode) => {
												if (currentNode.type() === "element") {
													//todo to implement title
													if (currentNode.name() === "Slot") {
														for (attr of currentNode.attrs()) {
															if ((attr.name() === "name") && attr.value() === "size") {
																document["size"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "hash") {
																document["hash"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "creationTime") {
																document["creationTime"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "serviceStartTime") {
																document["serviceStartTime"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "serviceStopTime") {
																document["serviceStopTime"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "sourcePatientId") {
																document["sourcePatientId"] = currentNode.child(0).child(0).text();
																return document;
															} else if ((attr.name() === "name") && attr.value() === "repositoryUniqueId") {
																document["repositoryUniqueId"] = currentNode.child(0).child(0).text();
																return document;
															}
														}
													} else if (currentNode.name() === "Classification") {
														//Template for XDSDocumentEntry.author

														// let classificationScheme = currentNode.attr("classificationScheme").value();
														if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:93606bcf-9494-43ec-9b4e-a7748d1a838d") {
															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "authorInstitution") {
																		document["authorInstitution"] = processHL7DataType("XON", node.child(0).child(0).text());


																	} else if (node.getAttribute("name").value() === "authorPerson") {
																		document["authorPerson"] = processHL7DataType("XCN", node.child(0).child(0).text());


																	} else if (node.getAttribute("name").value() === "authorSpecialty") {
																		document["authorSpecialty"] = node.child(0).child(0).text();
																	}
																} else {
																}
															}
															//Template : XDSDocumentEntry.classCode
														} else if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:41a5887f-8865-4c09-adf7-e362475b143a") {

															document["class"] = {};
															document["class"]["code"] = currentNode.getAttribute("nodeRepresentation").value();
															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "codingScheme") {
																		document["class"]["codingScheme"] = node.child(0).child(0).text();
																	}
																} else if (node.name() === "Name") {
																	if (node.child(0).name() === "LocalizedString") {
																		document["class"]["displayName"] = node.child(0).getAttribute("value").value();
																	} else {
																		console.log("did not find LocalizedString");

																	}
																} else {
																}
															}
															//Template : XDSDocuemtnEntry.formatCode
														} else if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:a09d5840-386c-46f2-b5ad-9c3699a4309d") {
															document["format"] = {};
															document["class"]["code"] = currentNode.getAttribute("nodeRepresentation").value();

															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "codingScheme") {
																		document["format"]["codingScheme"] = node.child(0).child(0).text();
																	}
																} else if (node.name() === "Name") {
																	if (node.child(0).name() === "LocalizedString") {
																		document["format"]["displayName"] = node.child(0).getAttribute("value").value();
																	} else {
																		console.log(chalk.red("did not find LocalizedString"));

																	}
																} else {
																}
															}

															//Template : XDSDocumentEntry.healthcareFacilityTypeCode
														} else if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:f33fb8ac-18af-42cc-ae0e-ed0b0bdb91e1") {

															document["healthcareFacilityType"] = {};
															document["healthcareFacilityType"]["code"] = currentNode.getAttribute("nodeRepresentation").value();
															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "codingScheme") {
																		document["healthcareFacilityType"]["codingScheme"] = node.child(0).child(0).text();
																	}
																} else if (node.name() === "Name") {
																	if (node.child(0).name() === "LocalizedString") {
																		document["healthcareFacilityType"]["displayName"] = node.child(0).getAttribute("value").value();
																	} else {
																		console.log(chalk.red("did not find LocalizedString"));
																	}
																} else {
																}
															}
															//Template : XDSDocumentEntry.practiceSettingCode
														} else if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:cccf5598-8b07-4b77-a05e-ae952c785ead") {
															document["practiceSetting"] = {};
															document["practiceSetting"]["code"] = currentNode.getAttribute("nodeRepresentation").value();
															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "codingScheme") {
																		document["practiceSetting"].codeSystem = node.child(0).child(0).text();
																	}
																} else if (node.name() === "Name") {
																	if (node.child(0).name() === "LocalizedString") {
																		document["practiceSetting"].displayName = node.child(0).getAttribute("value").value();
																	} else {
																		console.log(chalk.red("did not find LocalizedString"));
																	}
																} else {
																}
															}
															//Template : XDSDocumentEntry.typeCode
														} else if (currentNode.getAttribute("classificationScheme").value() === "urn:uuid:f0306f51-975f-434e-a61c-c59651d33983") {

															document["type"] = {};
															document["type"]["code"] = currentNode.getAttribute("nodeRepresentation").value();
															for (node of currentNode.childNodes()) {
																if (node.name() === "Slot") {
																	if (node.getAttribute("name").value() === "codingScheme") {
																		document["type"]["codingScheme"] = node.child(0).child(0).text();
																	}
																} else if (node.name() === "Name") {
																	if (node.child(0).name() === "LocalizedString") {
																		document["type"]["displayName"] = node.child(0).getAttribute("value").value();
																	} else {
																		console.log(chalk.red("did not find LocalizedString"));
																	}
																} else {
																}
															}
														} else {
															console.log(chalk.cyan(currentNode.getAttribute("classificationScheme").value()));
														}
													} else if (currentNode.name() === "ExternalIdentifier") {
														if ("XDSDocumentEntry.patientId" === currentNode.child(0).child(0).getAttribute("value").value()) {
															document['patientId'] = currentNode.getAttribute("value").value().substr(0, currentNode.getAttribute("value").value().indexOf("^"));
														} else if ("XDSDocumentEntry.uniqueId" === currentNode.child(0).child(0).getAttribute("value").value()) {
															document['documentId'] = currentNode.getAttribute("value").value();
														} else {

														}

													} else {
													}
												}
												return document;
											}, {})
										}
									}

								}));

					}
				});

		} catch (ex) {
			reject(ex);
		}
	});


}


let getDocument = ({ product, user, organisation }, patient, document) => {
	return new Promise((resolve, reject) => {
		try {
			executeRequest(organisation, "getDocument",
				signRequest(
					buildUnsignedB2BRequest(
						buildHeader(product, user, organisation, patient, "urn:ihe:iti:2007:RetrieveDocumentSet"),
						`<RetrieveDocumentSetRequest xmlns="urn:ihe:iti:xds-b:2007">
                            <DocumentRequest>
                                <RepositoryUniqueId>${document.repositoryUniqueId}</RepositoryUniqueId>
                                <DocumentUniqueId>${document.documentId}</DocumentUniqueId>
                            </DocumentRequest>
                        </RetrieveDocumentSetRequest>`
					),
					organisation
				),
				async (error, httpResponse, body) => {
					if (error) {
						reject(error);
						return;
					}

					if (httpResponse.statusCode === 500) {
						let xmlDoc = libxmljs.parseXml(body);
						let errorCode = xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='errorCode']").text();
						let errorMessage = xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text();

						if (errorCode === 'PCEHR_ERROR_3002') {
							reject({
								response: {
									code: errorCode,
									message: errorMessage,
									type: 'XDSRepositoryError'
								}
							});
						} else {
							resolve({
								response: {
									code: errorCode,
									message: errorMessage
								}
							});
						}
					} else if (httpResponse.statusCode >= 200 && httpResponse.statusCode < 300) {
						try {
							const contentType = httpResponse.headers['content-type'];

							if (!contentType) {
								reject('Content-Type header is missing in the HTTP response');
								return;
							}

							if (!contentType.includes("application/soap+xml")) {
								reject("Unsure on how to handle response payload. Content Type: " + contentType);
								return;
							}

							fs.writeFile("./Test 43 Response.xml", body, function (err) {
								if (err) {
									return console.log(err);
								}
							});

							fs.writeFile("./Test 43 Request.xml", httpResponse.request.body, function (err) {
								if (err) {
									return console.log(err);
								}
							});

							let boundaryPart = contentType.split(';').find(ct => ct.trim().startsWith("boundary="));
							if (!boundaryPart) {
								let xmlDoc = libxmljs.parseXml(body);
								resolve({
									response: {
										code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='RetrieveDocumentSetResponse']/*[local-name()='RegistryResponse']/*[local-name()='RegistryErrorList']/*[local-name()='RegistryError']").getAttribute("errorCode").value(),
										message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='RetrieveDocumentSetResponse']/*[local-name()='RegistryResponse']/*[local-name()='RegistryErrorList']/*[local-name()='RegistryError']").getAttribute("codeContext").value(),
									},
								})
								return;
							}

							const boundary = "--" + contentType.split(';').find(ct => ct.trim().startsWith("boundary=")).trim().substring(9).replace(/['"]+/g, '');
							let parts = parseMultipart(body, boundary);

							const cdafile = extractBinaryFile(parts[1]);
							const outputPath = './xml/CDAPackage.zip';
							await saveFile(cdafile, outputPath);
							resolve({ ...document, outputPath });

						} catch (parseError) {
							console.error("Error processing response:", parseError);
							reject(parseError);
						}
					} else {
						reject("Received unexpected status code: " + httpResponse.statusCode);
					}
				}, { encoding: null }
			);
		} catch (e) {
			reject(e);
		}
	});
};

// Helper functions for processing multipart messages, extracting binary content, and saving files
function parseMultipart(body, boundary) {
	let parts = [];
	let offset = 0;
	while (offset !== -1) {
		let nextOffset = body.indexOf(boundary, offset + 1);
		parts.push(body.slice(offset + boundary.length, nextOffset === -1 ? undefined : nextOffset));
		offset = nextOffset;
	}
	return parts;
}

function extractBinaryFile(part) {
	return part.slice(part.indexOf("Content-Transfer-Encoding: binary") + 37, part.indexOf("------=_") - 1);
}

async function saveFile(data, path) {
	const fs = require('fs');
	const JSZip = require('jszip');
	const zip = new JSZip();
	zip.file('file.zip', data, { binary: true });
	await zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
		.pipe(fs.createWriteStream(path))
		.on('finish', () => {
			console.log('Zip file created successfully');
		});
}


let uploadDocument = ({ product, user, organisation }, patient, document) => {

	return new Promise((resolve, reject) => {

		let extrinsicObjectStructure = [
			{
				type: 'slot',
				name: 'creationTime',
				source: 'metadata',
			},
			{
				type: 'slot',
				name: 'languageCode',
				source: 'metadata',
				default: 'en-AU'
			},
			{
				type: 'slot',
				name: 'serviceStartTime',
				source: 'metadata',
			},
			{
				type: 'slot',
				name: 'serviceStopTime',
				source: 'metadata',
			},
			{
				type: 'slot',
				name: 'sourcePatientId',
				source: 'metadata',
			},
			{
				type: 'name',
				source: 'metadata',
				'name': 'name'
			},
			{
				id: "cl01",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:93606bcf-9494-43ec-9b4e-a7748d1a838d",
				nodeRepresentation: "",
				slots: [
					{
						name: "authorInstitution",
						value: "authorInstitution",
						subvalue: "hl7"
					},
					{
						name: "authorPerson",
						value: "authorPerson",
						subvalue: "hl7"
					},
					{
						name: "authorSpecialty",
						value: "authorSpecialty"
					}
				]
			},
			{
				id: "cl02",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:41a5887f-8865-4c09-adf7-e362475b143a",
				dynamicNodeRepresentation: { value: "type", subvalue: "code" },
				slots: [
					{
						name: "codingScheme",
						value: "class",
						subvalue: "codeSystemName"
					}
				],
				names: [
					{
						value: "class",
						subvalue: "displayName"
					}
				]
			},
			{
				id: "cl03",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:f4f85eac-e6cb-4883-b524-f2705394840f",
				nodeRepresentation: "GENERAL",
				slots: [
					{
						name: "codingScheme",
						constant: "PCEHR_DocAccessLevels"

					}
				],
				names: [
					{
						constant: "NA"
					}
				]
			},
			{
				id: "cl04",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:a09d5840-386c-46f2-b5ad-9c3699a4309d",
				nodeRepresentation: "1.2.36.1.2001.1006.1.16473.14",
				slots: [
					{
						name: "codingScheme",
						value: "format",
						subvalue: "codingScheme"
					}
				],
				names: [
					{
						value: "format",
						subvalue: "displayName"
					}
				]
			},
			{
				id: "cl05",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:f33fb8ac-18af-42cc-ae0e-ed0b0bdb91e1",
				dynamicNodeRepresentation: { value: "healthcareFacilityType", subvalue: "code" },
				slots: [
					{
						name: "codingScheme",
						value: "healthcareFacilityType",
						subvalue: "codingScheme"
					}
				],
				names: [
					{
						value: "healthcareFacilityType",
						subvalue: "displayName"
					}
				]
			},
			{
				id: "cl06",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:cccf5598-8b07-4b77-a05e-ae952c785ead",
				dynamicNodeRepresentation: { value: "practiceSetting", subvalue: "code" },
				slots: [
					{
						name: "codingScheme",
						value: "practiceSetting",
						subvalue: "codingScheme"
					}
				],
				names: [
					{
						value: "practiceSetting",
						subvalue: "displayName"
					}
				]
			},
			{
				id: "cl07",
				type: 'classification',
				classifiedObject: "DOCUMENT_SYMBOLICID_01",
				scheme: "urn:uuid:f0306f51-975f-434e-a61c-c59651d33983",
				dynamicNodeRepresentation: { value: "type", subvalue: "code" },
				slots: [
					{
						name: "codingScheme",
						value: "type",
						subvalue: "codeSystemName"
					}
				],
				names: [
					{
						value: "type",
						subvalue: "displayName"
					}
				]
			},
			{
				id: 'ei01',
				type: 'externalIdentifier',
				scheme: "urn:uuid:58a6f841-87b3-4a3e-92fd-a8ffeff98427",
				value: "sourcePatientId",
				names: [
					{
						constant: "XDSDocumentEntry.patientId"
					}
				]
			},
			{
				id: 'ei02',
				type: 'externalIdentifier',
				scheme: "urn:uuid:2e82c1f6-a085-4c72-9da3-8640a32e42ab",
				value: 'documentId',
				names: [
					{
						constant: "XDSDocumentEntry.uniqueId"
					}
				]
			}

		];

		let registryPackage = [
			{
				type: 'slot',
				name: 'submissionTime',
				source: 'now',
			},
			{
				type: 'name',
				source: 'metadata',
				'name': 'name'
			},
			{
				id: "cl08",
				type: 'classification',
				classifiedObject: "SUBSET_SYMBOLICID_01",
				scheme: "urn:uuid:a7058bb9-b4e4-4307-ba5b-e3f0ab85e12d",
				nodeRepresentation: "",
				slots: [
					{
						name: "authorInstitution",
						value: "authorInstitution",
						subvalue: "hl7"
					},
					{
						name: "authorPerson",
						value: "authorPerson",
						subvalue: "hl7"
					},
					{
						name: "authorSpecialty",
						value: "authorSpecialty"
					}
				]
			},
			{
				id: "cl09",
				type: 'classification',
				classifiedObject: "SUBSET_SYMBOLICID_01",
				scheme: "urn:uuid:aa543740-bdda-424e-8c96-df4873be8500",
				dynamicNodeRepresentation: { value: "type", subvalue: "code" },
				slots: [
					{
						name: "codingScheme",
						value: "class",
						subvalue: "codeSystemName"
					}
				],
				names: [
					{
						value: "class",
						subvalue: "displayName"
					}
				]
			},
			{
				id: 'ei03',
				type: 'externalIdentifier',
				scheme: "urn:uuid:96fdda7c-d067-4183-912e-bf5ee74998a8",
				value: "documentId",
				names: [
					{
						constant: "XDSSubmissionSet.uniqueId"
					}
				]
			},
			{
				id: 'ei04',
				type: 'externalIdentifier',
				scheme: "urn:uuid:554ac39e-e3fe-47fe-b233-965d2a147832",
				value: { value: 'authorInstitution', subvalue: "organizationIdentifier" },
				names: [
					{
						constant: "XDSSubmissionSet.sourceId"
					}
				]
			},
			{
				id: 'ei05',
				type: 'externalIdentifier',
				scheme: "urn:uuid:6b5aea1a-874d-4603-a4bc-96a0a7b38446",
				value: "sourcePatientId",
				names: [
					{
						constant: "XDSSubmissionSet.patientId"
					}
				]
			},
		];

		let processSlot = (item, document) => {
			if (item.source === 'metadata') {
				return `<Slot name="${item.name}"><ValueList><Value>${document.metadata[item.name] ? document.metadata[item.name] : item.default}</Value></ValueList></Slot>`
			} else if (item.source === 'constant') {
				return `<Slot name="${item.name}"><ValueList><Value>${document.metadata[item.name]}</Value></ValueList></Slot>`
			} else if (item.source === 'now') {
				return `<Slot name="${item.name}"><ValueList><Value>${moment().format('YYYYMMDDHHmmss')}</Value></ValueList></Slot>`
			} else {
				return "oh no" +
					JSON.stringify(item);
			}
		}

		let processName = (item, document) => {
			if (item.source === 'metadata') {
				return `<Name><LocalizedString value="${document.metadata[item.name]}"/></Name>`;
			} else if (item.constant) {
				return `<Name><LocalizedString value="${item.constant}"/></Name>`;
			} else {
				return "oh no";
			}
		}


		let processClassification = (item, document, index) => {
			let processSlot = (slot) => {
				return `<Slot name="${slot.name}"><ValueList><Value>${slot.subvalue ? document.metadata[slot.value][slot.name] : slot.value ? document.metadata[slot.value] : slot.constant}</Value></ValueList></Slot>`
			}
			let processName = (name) => {
				return `<Name><LocalizedString value="${name.subvalue ? document.metadata[name.value][name.subvalue] : name.value ? document.metadata[name.value] : name.constant}"/></Name>`;
			}
			return `<Classification classificationScheme="${item.scheme}" classifiedObject="${item.classifiedObject}" id="${item.id}" nodeRepresentation="${item.dynamicNodeRepresentation ? typeof item.dynamicNodeRepresentation === 'string' ? document.metadata[item.dynamicNodeRepresentation.value] : document.metadata[item.dynamicNodeRepresentation.value][item.dynamicNodeRepresentation.subvalue] : item.nodeRepresentation}" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:Classification">${item.slots ? item.slots.map(processSlot).join("") : ""}${item.names ? item.names.map(processName).join("") : ""}</Classification>`;
		};

		let processExternalIdentifier = (item, document, index) => {
			return `<ExternalIdentifier id="${item.id}" identificationScheme="${item.scheme}" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:ExternalIdentifier" registryObject="SUBSET_SYMBOLICID_01" value="${typeof item.value === 'string' ? document.metadata[item.value] : document.metadata[item.value.value][item.value.subvalue]}">${item.names.map(name => processName(name, document)).join("")}</ExternalIdentifier>`;
		};

		let stableExtrinsicObjectMetadata = extrinsicObjectStructure.map((item, index) => {
			if (item.type === 'slot') {
				return { item: item, value: processSlot(item, document), type: "processSlot" };
			} else if (item.type === 'name') {
				return { item: item, value: processName(item, document), type: "processName" };
			} else if (item.type === "classification") {
				return { item: item, value: processClassification(item, document, index), type: "classification" };
			} else if (item.type === "externalIdentifier") {
				return { item: item.type, value: processExternalIdentifier(item, document, index), type: "externalIdentifier" };
			}
			else {

			}
		});


		let registryPackageMetadata = registryPackage.map((item, index) => {
			if (item.type === 'slot') {
				return { item: item, value: processSlot(item, document), type: "processSlot" };
			// }
			//  else if (item.type === 'name') {
			// 	return { item: item, value: processName(item, document), type: "processName" };
			} else if (item.type === "classification") {
				return { item: item, value: processClassification(item, document, index), type: "classification" };
			} else if (item.type === "externalIdentifier") {
				return { item: item.type, value: processExternalIdentifier(item, document, index), type: "externalIdentifier" };
			} else {
				return { item: item, value: "not processed", type: "else" };
			}
		});

		let request = signRequest(
			buildUnsignedB2BRequest(
				buildHeader(product, user, organisation, patient, "urn:ihe:iti:2007:ProvideAndRegisterDocumentSet-b"),
				`<ProvideAndRegisterDocumentSetRequest xmlns="urn:ihe:iti:xds-b:2007"><SubmitObjectsRequest xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:lcm:3.0"><RegistryObjectList xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0"><ExtrinsicObject id="DOCUMENT_SYMBOLICID_01" mimeType="application/zip" objectType="urn:uuid:7edca82f-054d-47f2-a032-9b2a5b5186c1" status="urn:oasis:names:tc:ebxml-regrep:StatusType:Approved">${stableExtrinsicObjectMetadata.map(item => item.value).join('')}</ExtrinsicObject><RegistryPackage id="SUBSET_SYMBOLICID_01" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:RegistryPackage">${registryPackageMetadata.map(item => item.value).join('')}</RegistryPackage><Classification classificationNode="urn:uuid:a54d6aa5-d40d-43f9-88c5-b4633d873bdd" classifiedObject="SUBSET_SYMBOLICID_01" id="cl10" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:Classification"/><Association associationType="urn:oasis:names:tc:ebxml-regrep:AssociationType:HasMember" id="as01" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:Association" sourceObject="SUBSET_SYMBOLICID_01" targetObject="DOCUMENT_SYMBOLICID_01"><Slot name="SubmissionSetStatus"><ValueList><Value>Original</Value></ValueList></Slot></Association></RegistryObjectList></SubmitObjectsRequest><Document id="DOCUMENT_SYMBOLICID_01">${document.package.toString('base64')}</Document></ProvideAndRegisterDocumentSetRequest>`
			), organisation
		);

		let packageReference = guid();

		fs.writeFile("./Test 39 Request.xml", request, function (err) {
			if (err) {
				return console.log(err);
			}
		});

		uploadDocumentMtom(request,
			document.package,
			`http://document/${packageReference}`,
			organisation,
			(error, httpResponse, body) => {
				if (error) {
					reject(error);
				}

				fs.writeFile("./Test 39 Response.xml", body, function (err) {
					if (err) {
						return console.log(err);
					}
				});

				console.log(httpResponse.statusCode)

				// try {
				// 	let xmlDoc = libxmljs.parseXml(httpResponse.headers["content-type"].includes("multipart") ? xop(httpResponse, body) : body.toString());

				// 	if ("urn:oasis:names:tc:ebxml-regrep:ResponseStatusType:Success" === xmlDoc.get("//soap:Envelope/soap:Body/ebxmlRegRep3:RegistryResponse/@status", namespaces).value()) {
				// 		resolve({
				// 			result: 'success',
				// 			document: { ...document, status: 'uploaded', uploadTime: new Date() }
				// 		});
				// 	} else {
				// 		reject({
				// 			result: "failed",
				// 			registryErrorList: xmlDoc.get("//soap:Envelope/soap:Body/ebxmlRegRep3:RegistryResponse/ebxmlRegRep3:RegistryErrorList", namespaces).childNodes().map(node => {
				// 				return {
				// 					'codeContext': node.attr('codeContext').value(),
				// 					'errorCode': node.attr('errorCode').value(),
				// 					'severity': node.attr('severity').value(),
				// 					'location': node.attr('location').value()
				// 				}
				// 			}),
				// 			body,
				// 			request
				// 		});
				// 	}
				// } catch (error) {
				// 	let xmlDoc = libxmljs.parseXml(body);
				// 	reject({
				// 		result: "error",
				// 		response: {
				// 			reason: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Reason']/*[local-name()='Text']").text(),
				// 			message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text(),
				// 			code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='errorCode']").text()
				// 		},
				// 	})
				// }
			}


		);


		/*
				
				executeRequest(organisation, "uploadDocument",
					signRequest(
						buildUnsignedB2BRequest(
							buildHeader(product, user, organisation, patient, "urn:ihe:iti:2007:ProvideAndRegisterDocumentSet-b"),
							`<ProvideAndRegisterDocumentSetRequest xmlns="urn:ihe:iti:xds-b:2007"><SubmitObjectsRequest xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:lcm:3.0"><RegistryObjectList xmlns="urn:oasis:names:tc:ebxml-regrep:xsd:rim:3.0"><ExtrinsicObject id="DOCUMENT_SYMBOLICID_01" mimeType="application/zip" objectType="urn:uuid:7edca82f-054d-47f2-a032-9b2a5b5186c1" status="urn:oasis:names:tc:ebxml-regrep:StatusType:Approved">${stableExtrinsicObjectMetadata.map(item => item.value).join('')}</ExtrinsicObject><RegistryPackage id="SUBSET_SYMBOLICID_01" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:RegistryPackage">${registryPackageMetadata.map(item => item.value).join('')}</RegistryPackage><Classification classificationNode="urn:uuid:a54d6aa5-d40d-43f9-88c5-b4633d873bdd" classifiedObject="SUBSET_SYMBOLICID_01" id="cl10" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:Classification"/><Association associationType="urn:oasis:names:tc:ebxml-regrep:AssociationType:HasMember" id="as01" objectType="urn:oasis:names:tc:ebxml-regrep:ObjectType:RegistryObject:Association" sourceObject="SUBSET_SYMBOLICID_01" targetObject="DOCUMENT_SYMBOLICID_01"><Slot name="SubmissionSetStatus"><ValueList><Value>Original</Value></ValueList></Slot></Association></RegistryObjectList></SubmitObjectsRequest><Document id="DOCUMENT_SYMBOLICID_01">${document.package.toString('base64')}</Document></ProvideAndRegisterDocumentSetRequest>`
						),
						organisation
					),
					(error, httpResponse, body) => {
						if (error){
							reject(error);
						}
		
						
						try {
		
							let xmlDoc = libxmljs.parseXml(httpResponse.headers["content-type"].includes("multipart") ? xop(httpResponse, body) : body.toString());
		
							if ("urn:oasis:names:tc:ebxml-regrep:ResponseStatusType:Success" === xmlDoc.get("//soap:Envelope/soap:Body/ebxmlRegRep3:RegistryResponse/@status", namespaces).value()){
								resolve({
									result: 'success',
									document: {...document, status: 'uploaded'}
								});
							}else{
								reject({
									result: "failed",
									registryErrorList: 	xmlDoc.get("//soap:Envelope/soap:Body/ebxmlRegRep3:RegistryResponse/ebxmlRegRep3:RegistryErrorList",namespaces).childNodes().map(node => {return {
										'codeContext':	node.attr('codeContext').value(),
										'errorCode':	node.attr('errorCode').value(),
										'severity':		node.attr('severity').value(),
										'location':		node.attr('location').value()
									}}),
									body
		
								});
							}
						}catch (error) {
							reject({
								result: "error",
								body: body
							});
						}
						
					}
				);
		*/

	});
}


module.exports = {
	getDocumentList,
	getDocument,
	uploadDocument
};


/*

					 */
const { signRequest, executeRequest, buildUnsignedB2BRequest, buildHeader } = require('./soap');
const libxmljs = require("libxmljs");


let doesPCEHRExist = ({ product, user, organisation }, patient) => {

	if (patient.ihi.length != 16) {
		console.log("Invalid IHI number format was used.")
		return
	}

	return new Promise((resolve, reject) => {
		let payload = buildUnsignedB2BRequest(
			buildHeader(product, user, organisation, patient, "http://ns.electronichealth.net.au/pcehr/svc/PCEHRProfile/1.1/PCEHRProfilePortType/doesPCEHRExistRequest"),
			`<doesPCEHRExist xsi:type="xsd:string" xmlns="http://ns.electronichealth.net.au/pcehr/xsd/interfaces/PCEHRProfile/1.0"></doesPCEHRExist>`
		);
		let signature = signRequest(payload
			,
			organisation
		);
		// console.log("this is signature :",signature);
		executeRequest(organisation, "doesPCEHRExist", signature,
			(error, response, body) => {
				//DEBUG
				const fs = require('fs');
				fs.writeFile("./testRequest/doesPCEHRExist_Request.xml", response.request.body.replace('\n', '').replace('\r', ''), function (err) {
					if (err) {
						return console.log(err);
					}
					// console.log("The file was saved!");
				});

				fs.writeFile("./testResponse/doesPCEHRExist_Response.xml", response.body.replace('\n', '').replace('\r', ''), function (err) {
					if (err) {
						return console.log(err);
					}
					// console.log("The file was saved!");
				});

				// console.log("this is request : ");
				// console.log('----')
				// console.log("this is resposne : ",response.body.replace('\n', '').replace('\r', ''));
				//end.
				if (error) {
					reject(error);
				} else {
					console.log(body)
					let xmlDoc = libxmljs.parseXml(body);
					const pcehrExistsNode = xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='doesPCEHRExistResponse']/*[local-name()='PCEHRExists']");
					if (pcehrExistsNode) {
						resolve({
							"pcehrExists": xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='doesPCEHRExistResponse']/*[local-name()='PCEHRExists']").text(),
							accessCodeRequired: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='doesPCEHRExistResponse']/*[local-name()='accessCodeRequired']") ? xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='doesPCEHRExistResponse']/*[local-name()='accessCodeRequired']").text() : null
						});
					} else {
						resolve({
							"errors": true,
							"messages": xmlDoc.get("//*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text()
						});
					}

				}
			}
		);
	});
};


let gainAccess = ({ product, user, organisation }, patient, accessType, accessCode) => {

	if (!patient.ihi || patient.ihi === "") {
		console.log("IHI number required.")
		return
	}

	return new Promise((resolve, reject) => {
		let accessPayload = "";
		if (accessType === "EmergencyAccess") {
			accessPayload = "<authorisationDetails><accessType>EmergencyAccess</accessType></authorisationDetails>";
		} else if (accessType === "AccessCode") {
			if (accessCode === "") {
				console.log("Access Code MUST be supplied.")
				reject("Access Code MUST be supplied.")
			}
			accessPayload = "<authorisationDetails><accessType>AccessCode</accessType><accessCode>" + accessCode + "</accessCode></authorisationDetails>";
		} else {
			if (!((accessType !== "standard") || (accessType !== "noAccessCode") || (accessType !== "noCode"))) {
				resolve(new Error("invalid AccessType"));
			}
		}
		executeRequest(organisation, "gainPCEHRAccess",
			signRequest(
				buildUnsignedB2BRequest(
					buildHeader(product, user, organisation, patient, "http://ns.electronichealth.net.au/pcehr/svc/PCEHRProfile/1.1/PCEHRProfilePortType/gainPCEHRAccessRequest"),
					`<gainPCEHRAccess xmlns="http://ns.electronichealth.net.au/pcehr/xsd/interfaces/PCEHRProfile/1.0"><PCEHRRecord>${accessPayload}</PCEHRRecord></gainPCEHRAccess>`
				),
				organisation
			),
			(error, response, body) => {
				//DEBUG
				const fs = require('fs');
				fs.writeFile("./testRequest/gainPCEHRAccess_Request.xml", response.request.body.replace('\n', '').replace('\r', ''), function (err) {
					if (err) {
						return console.log(err);
					}
					// console.log("The file was saved!");
				});

				fs.writeFile("./testResponse/gainPCEHRAccess_Response.xml", response.body.replace('\n', '').replace('\r', ''), function (err) {
					if (err) {
						return console.log(err);
					}
					// console.log("The file was saved!");
				});

				if (response.statusCode == 500) {
					let xmlDoc = libxmljs.parseXml(body);
					resolve({
						response: {
							errors: true,
							code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='errorCode']").text(),
							message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text()
						},
					})
				} else {
					//end.
					if (error) {
						reject(error);
					} else {
						let xmlDoc = libxmljs.parseXml(body);
						const success = xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='responseStatus']/*[local-name()='description']").text() == "SUCCESS";
						//todo: use namespaces rather than relying on wild card operators
						if (success) {
							resolve({
								response: {
									code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='responseStatus']/*[local-name()='code']").text(),
									description: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='responseStatus']/*[local-name()='description']").text()
								},
								patient: {
									ihiNumber: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='ihiNumber']").text(),
									ihiRecordStatus: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='ihiRecordStatus']").text(),
									ihiStatus: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='ihiStatus']").text(),
									dateOfBirth: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='dateOfBirth']").text(),
									dateAccuracyIndicatorType: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='dateAccuracyIndicatorType']").text(),
									sex: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='sex']").text(),
									name: {
										family: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='name']/*[local-name()='familyName']").text(),
										given: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='individual']/*[local-name()='name']/*[local-name()='givenName']").text()
									}
								}
							});
						} else {
							resolve({
								response: {
									errors: true,
									code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='responseStatus']/*[local-name()='code']").text(),
									description: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='gainPCEHRAccessResponse']/*[local-name()='responseStatus']/*[local-name()='description']").text()
								},
							});
						}

					}
				}
			}
		);
	});
};


module.exports = {
	doesPCEHRExist,
	gainAccess
}
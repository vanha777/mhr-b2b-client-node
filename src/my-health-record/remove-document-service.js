const { signRequest, executeRequest, buildUnsignedB2BRequest, buildHeader } = require('./soap');
const libxmljs = require("libxmljs");


let removeDocument = ({ product, user, organisation }, patient, remove_document_id, reasons) => {
	const fs = require('fs');
	if (patient.ihi.length != 16) {
		console.log("Invalid IHI number format was used.")
		return
	}

	return new Promise((resolve, reject) => {
		let payload = buildUnsignedB2BRequest(
			buildHeader(product, user, organisation, patient, "http://ns.electronichealth.net.au/pcehr/svc/RemoveDocument/1.1/RemoveDocumentPortType/removeDocumentRequest"),
			`<removeDocument xmlns="http://ns.electronichealth.net.au/pcehr/xsd/interfaces/RemoveDocument/1.0">
				<documentID>${remove_document_id}</documentID>
				<reasonForRemoval>${reasons}</reasonForRemoval>
			</removeDocument>`
		);
		let signature = signRequest(payload
			,
			organisation
		);
		// console.log("this is signature :",signature);
		executeRequest(organisation, "removeDocument", signature,
			(error, response, body) => {
				//DEBUG

				if (response.statusCode == 500) {
					fs.writeFile("./testRequest/removeDocument_Request.xml", response.request.body.replace('\n', '').replace('\r', ''), function (err) {
						if (err) {
							return console.log(err);
						}
						// console.log("The file was saved!");
					});
					fs.writeFile("./testResponse/removeDocument-Response.xml", response.body.replace('\n', '').replace('\r', ''), function (err) {
						if (err) {
							return console.log(err);
						}
						// console.log("The file was saved!");
					});
					let xmlDoc = libxmljs.parseXml(body);
					resolve({
						response: {
							code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='errorCode']").text(),
							message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text()
						},
					})
				} else {

					fs.writeFile("./testRequest/removeDocument_Request.xml", response.request.body.replace('\n', '').replace('\r', ''), function (err) {
						if (err) {
							return console.log(err);
						}
						// console.log("The file was saved!");
					});

					fs.writeFile("./testResponse/removeDocument-Response.xml", response.body.replace('\n', '').replace('\r', ''), function (err) {
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
						let xmlDoc = libxmljs.parseXml(body);
						resolve({
							"code": xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='removeDocumentResponse']/*[local-name()='responseStatus']/*[local-name()='code']").text(),
							"description": xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='removeDocumentResponse']/*[local-name()='responseStatus']/*[local-name()='description']").text(),
						});
					}
				}
			}
		);
	});
};


module.exports = {
	removeDocument,
}
const { signRequest, executeRequest, buildUnsignedB2BRequest, buildHeader } = require('./soap');
const libxmljs = require("libxmljs");


let removeDocument = ({ product, user, organisation }, patient, document_id, reason) => {

	if (patient.ihi.length != 16) {
		console.log("Invalid IHI number format was used.")
		return
	}

	return new Promise((resolve, reject) => {
		let payload = buildUnsignedB2BRequest(
			buildHeader(product, user, organisation, patient, "http://ns.electronichealth.net.au/pcehr/svc/RemoveDocument/1.1/RemoveDocumentPortType/removeDocumentRequest"),
			`<removeDocument xmlns="http://ns.electronichealth.net.au/pcehr/xsd/interfaces/RemoveDocument/1.0">
				<documentID>${document_id}</documentID>
				<reasonForRemoval>${reason}</reasonForRemoval>
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
				
				if(response.statusCode == 500) {
					let xmlDoc = libxmljs.parseXml(body);
					resolve({
						response: {
							code: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='errorCode']").text(),
							message: xmlDoc.get("/*[local-name()='Envelope']/*[local-name()='Body']/*[local-name()='Fault']/*[local-name()='Detail']/*[local-name()='standardError']/*[local-name()='message']").text()
						},
					})
				} else {
					const fs = require('fs');
					fs.writeFile("C:\\Users\\EricAlforque\\Desktop\\testcases\\Test 49 Request.xml", response.request.body.replace('\n', '').replace('\r', ''), function(err) {
						if(err) {
							return console.log(err);
						}
						// console.log("The file was saved!");
					}); 
	
					fs.writeFile("C:\\Users\\EricAlforque\\Desktop\\testcases\\Test 49 Response.xml", response.body.replace('\n', '').replace('\r', ''), function(err) {
						if(err) {
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
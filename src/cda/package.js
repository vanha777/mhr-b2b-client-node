const shasum = require('crypto').createHash('sha1');
let guid = require('uuid').v4;
let moment = require('moment');
const SignedXml = require('xml-crypto').SignedXml;
let JSZip = require("jszip");

let concat = (set, value) => `${set}${value}`;
let package = (patient, document_id, document, organisation, individual, attachments) => {
	return new Promise((resolve, reject) => {

		try {

			if (typeof document === "string") {
				//test
				document = document.replace("{{document_id}}", document_id);

				document = document.replace("{{first_name}}", patient.first_name);
				document = document.replace("{{last_name}}", patient.last_name);
				document = document.replace("{{dob}}", patient.dob.replace(/-/g, ""));
				document = document.replace("{{ihi}}", patient.ihi);
				document = document.replace("{{street}}", patient.street);
				document = document.replace("{{state}}", patient.state);
				document = document.replace("{{city}}", patient.city);
				document = document.replace("{{post_code}}", patient.post_code);

				document = document.replace(/{{organization_name}}/g, organisation.name);
				document = document.replace(/{{hpio}}/g, organisation.hpio);
				//end.
				shasum.update(document);
				let signedPayloadDataId = "Id_" + guid();

				let xmlSign = `<signedPayload xmlns="http://ns.electronichealth.net.au/xsp/xsd/SignedPayload/2010"><signatures></signatures><signedPayloadData id="${signedPayloadDataId}"><q1:eSignature xmlns:q1="http://ns.electronichealth.net.au/cdaPackage/xsd/eSignature/2012"><Manifest xmlns="http://www.w3.org/2000/09/xmldsig#"><Reference URI="CDA_ROOT.XML"><DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><DigestValue>${shasum.digest('base64')}</DigestValue></Reference></Manifest><q1:signingTime>${moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ")}</q1:signingTime><q1:approver><q1:personId>http://ns.electronichealth.net.au/id/hi/hpii/1.0/${individual.hpii}</q1:personId><q1:personName>${individual.name[0].nameTitle ? individual.name[0].nameTitle.map(title => `<q1:nameTitle>${title}</q1:nameTitle>`).reduce(concat) : ""}${individual.name[0].given ? individual.name[0].given.map(title => `<q1:givenName>${title}</q1:givenName>`).reduce(concat) : ""}<q1:familyName>${individual.name[0].family}</q1:familyName>${individual.name[0].suffix ? individual.name[0].suffix.map(title => `<q1:nameSuffix>${title}</q1:nameSuffix>`).reduce(concat) : ""}</q1:personName></q1:approver></q1:eSignature></signedPayloadData></signedPayload>`;

				let sig = new SignedXml();
				sig.signingKey = organisation.privatePem;

				sig.addReference("/*[local-name()='signedPayload']/*[local-name()='signedPayloadData']");
				function MyKeyInfo() {
					this.getKeyInfo = function (key, prefix) {
						prefix = prefix || ''
						prefix = prefix ? prefix + ':' : prefix
						return `<X509Data><X509Certificate>${organisation.publicPem.toString().substring(organisation.publicPem.toString().indexOf("-----BEGIN CERTIFICATE-----") + 28, organisation.publicPem.toString().indexOf("-----END CERTIFICATE-----")).replace(/\n/g, '')}</X509Certificate></X509Data>`
					}
					this.getKey = function (keyInfo) {
						return organisation.privatePem;
					}
				}

				sig.keyInfoProvider = new MyKeyInfo();
				sig.computeSignature(xmlSign, {
					location: {
						reference: "/*[local-name()='signedPayload']/*[local-name()='signatures']",
						action: "prepend"
					}
				});

				var clinicalPackage = new JSZip();
				clinicalPackage.folder('IHE_XDM').folder('SUBSET01')
					.file("CDA_SIGN.XML", sig.getSignedXml())
					.file("CDA_ROOT.XML", document);
				if (attachments) {
					attachments.forEach(attachment => clinicalPackage.folder('IHE_XDM').folder('SUBSET01').file(attachment.filename, attachment.buffer));
				}
				clinicalPackage.generateAsync({ type: "nodebuffer", compression: "DEFLATE" })
					.then(function (content) {
						resolve(content);
					});
			} else {
				reject("document should be of type 'string' not " + typeof document)
			}
		} catch (exception) {
			reject(exception);
		}
	});
}


module.exports = { createPackage: package };

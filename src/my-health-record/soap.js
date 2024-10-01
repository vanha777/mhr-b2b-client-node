const	guid = require('uuid').v4;
const	moment = require('moment');
const	SignedXml = require('xml-crypto').SignedXml;
const	fs = require('fs');
const	endpoint = "services.svt.gw.myhealthrecord.gov.au";
const	request = require('request');
const 	flattenName = require('../cda/common-cda').flattenName;

const https = require('https');
const axios = require('axios');

let signRequest = (payload, organisation) => {
	// console.log("this is payload: ",payload);
	let sig = new SignedXml();
	sig.addReference("/*[local-name()='Envelope']/*[local-name()='Body']");
	sig.addReference("/*[local-name()='Envelope']/*[local-name()='Header']/*[local-name()='PCEHRHeader']");
	sig.addReference("/*[local-name()='Envelope']/*[local-name()='Header']/*[local-name()='timestamp']");
	
	sig.signingKey = organisation.privatePem;// fs.readFileSync("client.pem");//
	function KeyInfo() {
		this.getKeyInfo = function(key, prefix) {
			prefix = prefix || ''
			prefix = prefix ? prefix + ':' : prefix
			return `<X509Data><X509Certificate>${organisation.publicPem.toString().substring(organisation.publicPem.toString().indexOf("-----BEGIN CERTIFICATE-----")+ 28,organisation.publicPem.toString().indexOf("-----END CERTIFICATE-----")).replace(/\n/g, '')}</X509Certificate></X509Data>`
		}
		this.getKey = function(keyInfo) {
			return organisation.privatePem;
		}
	}
	
	sig.keyInfoProvider = new KeyInfo();
	sig.computeSignature(payload, {
		location: {
			reference: "/*[local-name()='Envelope']/*[local-name()='Header']/*[local-name()='signature']",
			action: "prepend"
		}
	});
	return sig.getSignedXml();
}
	

let buildUnsignedB2BRequest = (header, payload) => {
	return `<s:Envelope xmlns:a="http://www.w3.org/2005/08/addressing" xmlns:s="http://www.w3.org/2003/05/soap-envelope">${header}<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xml:id="body-${guid()}">${payload}</s:Body></s:Envelope>`;
}

let buildHeader  = (product, user, organisation, patient, methodName) => {
	if (!user.hpii && !user.id){
		throw "User must have HPI-I or an id";
	}
	return `<s:Header><a:Action s:mustUnderstand="1">${methodName}</a:Action><h:PCEHRHeader xmlns="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:h="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0" xml:id="header-${guid()}"><User><IDType>${user.hpii ? "HPII" : "LocalSystemIdentifier"}</IDType><ID>${user.hpii ? user.hpii : user.id}</ID><userName>${flattenName(user.name[0])}</userName><useRoleForAudit>false</useRoleForAudit></User><ihiNumber>${patient.ihi}</ihiNumber><productType><vendor>${product.vendor}</vendor><productName>${product.name}</productName><productVersion>${product.version}</productVersion><platform>${product.platform}</platform></productType><clientSystemType>${product.clientSystemType}</clientSystemType><accessingOrganisation><organisationID>${organisation.hpio}</organisationID><organisationName>${organisation.name}</organisationName></accessingOrganisation></h:PCEHRHeader><h:signature xmlns="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0" xmlns:h="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0"></h:signature><h:timestamp xmlns="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0" xmlns:h="http://ns.electronichealth.net.au/pcehr/xsd/common/CommonCoreElements/1.0" xml:id="timestamp-${guid()}"><created>${moment().format()}</created></h:timestamp><a:MessageID>urn:uuid:${guid()}</a:MessageID><a:ReplyTo><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:ReplyTo><a:From><a:Address>http://www.w3.org/2005/08/addressing/anonymous</a:Address></a:From><a:To s:mustUnderstand="1">http://www.w3.org/2005/08/addressing/anonymous</a:To></s:Header>`;
}

let executeRequest = (organisation, urlPath, payload, responseHandler, options) => {
	var fixedOptions = {
		url: `https://${endpoint}/${urlPath}`,
		method: 'POST',
		agentOptions: {
			cert: organisation.publicPem,
			key: organisation.privatePem,
			ca: organisation.ca,
			securityOptions: 'SSL_OP_NO_SSLv3',
			rejectUnauthorized: false

		},
		body: payload,
		headers: {
			'User-Agent':			'request',
			"Content-type":			'application/soap+xml; charset=utf-8',
			'Accept': 				'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
			'Accept-Encoding':		'gzip, deflate',
			'Accept-Charset':		'utf-8',
			'Connection':			'Keep-Alive',
			'Host':					endpoint
		}
	};
	//debug
	console.log("this is fixedOptions ",fixedOptions.url);
	//end.
	const httpsAgent = new https.Agent({
		cert: organisation.publicPem,
		key: organisation.privatePem,
		ca: organisation.ca
		// ,rejectUnauthorized: false
	});
	// Debug
	// console.log("",payload);
	// end.
//	https.Agent({  })


request({...fixedOptions, ...options}, responseHandler);

// request({...fixedOptions, ...options}, (error, response, body) => {

// 	// console.log("payload");
// 	// console.log(payload);
	
// 	console.log("error");
// 	console.log(error);

// 	console.log("response");
// 	console.log(response);
	
// 	console.log("body");
// 	console.log(body);

// });


// 	axios.get(fixedOptions.url, { httpsAgent }).then(result => {
// 		console.log(result);
// 	})
// 	.catch(error => {
// 		console.error(error.toJSON())
// 	});

}

module.exports = {
	executeRequest,
	signRequest,
	buildUnsignedB2BRequest,
	buildHeader
};


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

const	libxmljs = require("libxmljs");	
const 	namespaces = require('./namespaces');

const	request = require('request');
const	chalk = require('chalk');

let getAttachment = function(httpResponse, body) {

	let boundary = "--"+httpResponse.headers["content-type"].split(';')
	.find(contentType => contentType.trim().substr(0, 9) === "boundary=")
	.trim().substr(9).replace(/['"]+/g, '');
	let offset = 0;
	let parts = [];

	while (offset !== -1){
		let nextOffset = body.indexOf(boundary,offset+1);
		parts.push(body.slice(offset+boundary.length, nextOffset === -1 ? undefined : nextOffset));
		offset = nextOffset;
	}

	return (
		parts.reduce((accumulator, currentPart) => {
			let mimeValues = [];
			let remainingPart = Buffer.from(currentPart);
			let binaryPayload, currentChunk;
			while (remainingPart.length > 0){
				currentChunk = remainingPart.slice(0, remainingPart.indexOf("\n", 1 ));
				remainingPart = remainingPart.slice(remainingPart.indexOf("\n")+1);

				if (currentChunk.toString().trim().length === 0){
					if (mimeValues.length > 0 ){
						binaryPayload = remainingPart;
						break;
					}
				}else{
					if (currentChunk.indexOf(":") !== -1){
						mimeValues.push({
							attribute: 	currentChunk.toString().trim().substr(0, currentChunk.toString().trim().indexOf(":")),
							value: 		currentChunk.toString().trim().substr(currentChunk.toString().trim().indexOf(":")+1).trim()
						});
					}
				}
			}


			if (mimeValues.some(element => (
				(	element.value === "application/zip" || 
					element.value === "application/octet-stream"
				)
				 &&
				(element.attribute === "Content-Type")))){
					return {...accumulator, package: binaryPayload};
			}else{
				return accumulator;
			}
		}, {})
	);
};


let xop = function(httpResponse, body) {

	let boundary = "--"+httpResponse.headers["content-type"].split(';')
	.find(contentType => contentType.trim().substr(0, 9) === "boundary=")
	.trim().substr(9).replace(/['"]+/g, '');
	let offset = 0;
	let parts = [];


	while (offset !== -1){
		let nextOffset = body.indexOf(boundary,offset+1);
		parts.push(body.slice(offset+boundary.length, nextOffset === -1 ? undefined : nextOffset));
		offset = nextOffset;
	}

	
		let responseParts = parts.map((currentPart) => {
			let mimeValues = [];
			let remainingPart = Buffer.from(currentPart);
			let binaryPayload, currentChunk;
			while (remainingPart.length > 0){
				currentChunk = remainingPart.slice(0, remainingPart.indexOf("\n", 1 ));
				remainingPart = remainingPart.slice(remainingPart.indexOf("\n")+1);

				if (currentChunk.toString().trim().length === 0){
					if (mimeValues.length > 0 ){
						binaryPayload = remainingPart;
						break;
					}
				}else{
					if (currentChunk.indexOf(":") !== -1){
						mimeValues.push({
							attribute: 	currentChunk.toString().trim().substr(0, currentChunk.toString().trim().indexOf(":")),
							value: 		currentChunk.toString().trim().substr(currentChunk.toString().trim().indexOf(":")+1).trim()
						});
					}
				}
			}


			if (mimeValues.some(element => 
				(
					(	element.attribute === "Content-Type" &&
						element.value === 'application/xop+xml; charset=UTF-8; type="application/soap+xml"'
					)
				))){
					return {type: "xmlResponse", binaryPayload};

			}else if (mimeValues.some(element => 
				(
					(	element.attribute === "Content-Type" &&
						element.value === 'application/octet-stream'
					)
				))){
					return {type: "attachment", contentId: mimeValues.find(element=> element.attribute === "Content-Id").value ,binaryPayload};

			}else{
				return {};
			}
		}, {})
		
		let xmlResponse = responseParts.find(element => element.type === "xmlResponse").binaryPayload.toString();


		responseParts.forEach(part => {
			if (part.type === "attachment"){
				xmlResponse = xmlResponse.replace(
					`<xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:${part.contentId.replace(/[<>]+/g, '')}"/>` ,
					part.binaryPayload.toString().trim()
				);


			}
		})
		return xmlResponse;


};


let uploadDocumentMtom = (originalRequest, package, binaryContentId, organisation , processResponse ) => {


	let strippedPayload = `${originalRequest.substring(0, originalRequest.indexOf('<Document id="DOCUMENT_SYMBOLICID_01" xmlns="urn:ihe:iti:xds-b:2007')+69)}<xop:Include href="cid:${binaryContentId}" xmlns:xop="http://www.w3.org/2004/08/xop/include"/>${originalRequest.substring(originalRequest.indexOf('</Document>'))}`;

	request({
		method: 'POST',
		preambleCRLF: true,
		postambleCRLF: true,
		agentOptions: {
			cert: organisation.publicPem,
			key: organisation.privatePem,
			ca: organisation.ca,
			securityOptions: 'SSL_OP_NO_SSLv3',
			rejectUnauthorized: false
		},
		headers: {
			'MIME-Version': '1.0'
		},
		'host': 'b2b.ehealthvendortest.health.gov.au',
		'gzip' :true,
		'chunked': true,
		uri: 'https://b2b.ehealthvendortest.health.gov.au/uploadDocument',
		multipart: [
			{
				'Content-Type': 'application/xop+xml;charset=utf-8;type="application/soap+xml"',
				'Content-Transfer-Encoding': '8bit',
				body: strippedPayload
			},
			{
				'Content-ID': `<${binaryContentId}>`,
				'Content-Type': 'application/octet-stream',
				'Content-Transfer-Encoding': 'binary',
				body: package,
			}
		]
		},
		processResponse	
	);
}

module.exports = {
	getAttachment,
	xop,
	uploadDocumentMtom
}
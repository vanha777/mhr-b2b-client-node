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
const 	{signRequest, executeRequest, buildUnsignedB2BRequest, buildHeader} = require('./soap');
const	libxmljs = require("libxmljs");


let uploadDocument = ({product, user, organisation}, patient, document) => {

	return new Promise((resolve, reject) => {
		try{
		executeRequest(organisation, "uploadDocument",
		signRequest(
			buildUnsignedB2BRequest(
				buildHeader(product, user, organisation, patient, "urn:ihe:iti:2007:RegistryStoredQuery"),
				`<RetrieveDocumentSetRequest xmlns="urn:ihe:iti:xds-b:2007">
				<DocumentRequest>
					<RepositoryUniqueId>${document.repositoryUniqueId}</RepositoryUniqueId>
					<DocumentUniqueId>${document.documentId}</DocumentUniqueId>
				</DocumentRequest>
			</RetrieveDocumentSetRequest>
				`
			),
			organisation
		),
		(error, httpResponse, body) => {
			if (error){
				reject(error);
			}else{
				//let response = httpMessageParser(body);
				

				if (httpResponse.headers["content-type"].includes("multipart")){
					resolve({...document, cdaPackage: processMimeMultipart(httpResponse, body).package });
				}else if (httpResponse.headers["content-type"].includes("application/soap+xml")){

					let xmlDoc = libxmljs.parseXml(body.toString());
					let base64Document = xmlDoc.get("//soap:Envelope/soap:Body/xds:RetrieveDocumentSetResponse/xds:DocumentResponse/xds:Document", namespaces).text();
					
					resolve(
						{	...document,
							 cdaPackage: Buffer.alloc(base64Document.length, base64Document, 'base64')
						});
					
				}else{
					reject("Unsure on how to handle response paylaod. Content Type: " + httpResponse.headers["content-type"]);
				}
			}

		}, {encoding: null}
		);
	}catch(e){
		reject(e);
	}
	});

}

module.exports = {
	uploadDocument
};
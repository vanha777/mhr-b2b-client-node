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

const recordAccessService 		= require('./record-access-service');
const documentExchangeService 	= require('./document-exchange-service');
const viewService 				= require('./view-service');


module.exports = {
	doesPCEHRExist: 	recordAccessService		.doesPCEHRExist,
	gainAccess: 		recordAccessService		.gainAccess,
	getDocumentList:	documentExchangeService	.getDocumentList,	
	getDocument:		documentExchangeService	.getDocument,
	uploadDocument:		documentExchangeService	.uploadDocument,
	getView: 			viewService				.getView
};
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

let ora 	= require('ora');
let async 	= require('async');

let doesPCEHRExistClientSample 					= require('./sample/my-health-record/record-access/doesPCEHRExistClientSample');
let gainAccessClientSample	 					= require('./sample/my-health-record/record-access/gainAccessClientSample');
let getDocumentClientSample						= require('./sample/my-health-record/document-exchange-service/getDocumentClientSample')
let getDocumentListClientSample					= require('./sample/my-health-record/document-exchange-service/getDocumentListClientSample');


let getDiagnosticImagingViewClientSample 		= require('./sample/my-health-record/view-service/getDiagnosticImagingViewClientSample');
let getMedicareOverviewClientSample 			= require('./sample/my-health-record/view-service/getMedicareOverviewClientSample');
let getPathologyViewClientSample 				= require('./sample/my-health-record/view-service/getPathologyViewClientSample');
let getPrescriptionAndDispenseViewClientSample 	= require('./sample/my-health-record/view-service/getPrescriptionAndDispenseViewClientSample');

let testRun = [
	{
		name: 		"Does PCEHR Exist",
		service: 	doesPCEHRExistClientSample
	},
	{
		name: "gain Access", 
		service: gainAccessClientSample
	},
	// {
	// 	name: "Get Document List", 
	// 	service: getDocumentListClientSample
	// },
	// {
	// 	name: "Get Document", 
	// 	service: getDocumentClientSample
	// },
	// {
	// 	name: "getDiagnosticImagingViewClientSample",
	// 	service: getDiagnosticImagingViewClientSample
	// },
	// {
	// 	name: "getMedicareOverviewClientSample",
	// 	service: getMedicareOverviewClientSample
	// },
	// {
	// 	name: "getPathologyViewClientSample",
	// 	service: getPathologyViewClientSample
	// },
	// {
	// 	name: "getPrescriptionAndDispenseViewClientSample",
	// 	service: getPrescriptionAndDispenseViewClientSample
	// }
];

async.series(testRun.map(webService => {
	return function (callback){
		let spinner = ora(`Performing ${webService.name} Web Service`).start();	
		webService.service()
			.then(result => {
				spinner.succeed(`Successfully completed ${webService.name} Web Service`);
				callback(null, result);
				}
			)
			.catch(error => {
				console.error(JSON.stringify(error));
				spinner.fail(`Failed ${webService.name} Web Service`)
				callback(error);
		});
	}
}));
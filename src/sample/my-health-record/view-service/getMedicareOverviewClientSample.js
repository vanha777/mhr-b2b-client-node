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

let product 		= require('./../../entities/product');
let user 			= require('./../../entities/user');
let organisation 	= require('./../../entities/provider-organisations.js').PHARMACY[0];
let patient 		= require('./../../entities/patients').FRANKHARDING;

let myHealthRecordClient = require('../../../my-health-record');

module.exports = function(){
	//returns Promise
	return myHealthRecordClient.getView(
		{product,user,organisation},
		patient,
		{	
			view: "medicare",
			version: "1.0",
			parameters:{}}
		)
}

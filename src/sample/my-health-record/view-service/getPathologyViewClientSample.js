let product 		= require('../../entities/product');
let user 			= require('../../entities/user');
let organisation 	= require('./../../entities/provider-organisations.js').PHARMACY[0];
let patient 		= require('../../entities/patients').FRANKHARDING;

let myHealthRecordClient = require('../../../my-health-record');

module.exports = function(){
	//returns Promise
	return myHealthRecordClient.getView({product,user,organisation}, patient, {view: "pathology", version: "1.0",parameters:{}})
}

/*
myHealthRecordClient.getView({product,user,organisation}, patient, {view: "pathology",
version: "1.0",parameters:{}})
.then(result => {
	console.log(JSON.stringify(result));
})
.catch(error => console.error(error));

*/

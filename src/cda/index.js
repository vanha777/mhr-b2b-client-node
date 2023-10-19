let dispenseRecord 						= require('./dispenseRecord');
let dispenseRecordMetadata 				= require('./dispenseRecordMetadata');


let package 							= require('./package');

let diagnosticImagingReportMetadata 	= require('./diagnostic-imaging-report-metadata');
let diagnosticImagingReportSync			= require('./diagnostic-imaging-report').sync;
let diagnosticImagingReportAsync		= require('./diagnostic-imaging-report').promise;


let pathologyReportMetadata 			= require('./pathology-report-metadata');
let pathologyReportSync					= require('./pathology-report').sync;
let pathologyReportAsync				= require('./pathology-report').promise;



module.exports = {
	dispenseRecord,
	dispenseRecordMetadata,
	pathologyReportMetadata,
	pathologyReportSync,
	pathologyReportAsync,
	diagnosticImagingReportMetadata,
	diagnosticImagingReportSync,
	diagnosticImagingReportAsync,
	package
};
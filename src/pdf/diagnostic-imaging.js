const PDFDocument = require('pdfkit');
const	moment 							= require('moment');
const 	mapPathologyToCommonObjectMap 	= require('../cda/diagnostic-imaging-common-object-mapping');

let 	cda		= require('../cda/common-cda');

let renderCodeText = cda.renderCodeText;
const flattenName	= cda.flattenName;

const { Writable } = require('stream');



let pathologyTextTable = tests => {
	let longestTestName 		= tests.map(test => renderCodeText(test.name)).reduce((a, b) =>  a.length > b.length ? a : b )
	let longestValueName 		= tests.map(test => renderCodeText(test.value)).reduce((a, b) =>  a.length > b.length ? a : b )
	let longestStatusName 		= tests.some(test => test.status) ? tests.map(test => renderCodeText(test.status)).reduce((a, b) =>  a.length > b.length ? a : b ) : 0;
	let longestUnitName 		= tests.some(test => test.unit) ? tests.map(test => renderCodeText(test.status)).reduce((a, b) =>  a.length > b.length ? a : b ) : 0;
	let longestReferenceRange 	= tests.some(test => test.referenceRange) ? tests.map(test => renderCodeText(test.referenceRange)).reduce((a, b) =>  a.length > b.length ? a : b ) : 0;

	let header = "Test".padEnd(2+longestTestName.length) + "Result".padEnd(2+longestValueName.length, " ") +
		`${longestStatusName 		? "Status"		.padEnd(2+longestStatusName.length, " ") 		: ""}` +
		`${longestUnitName 			? "Unit"		.padEnd(2+longestUnitName.length, " ") 			: ""}` +
		`${longestReferenceRange 	? "Ref Range"	.padEnd(2+longestUnitName.length, " ") 			: ""}` ;

		return [
			header.trim(),
			...tests.map(test => `${renderCodeText(test.name).padEnd(2+longestTestName.length)}${renderCodeText(test.value).padEnd(2+longestValueName.length)}${test.status ? renderCodeText(test.status).padEnd(2+longestStatusName.length) : ""}${test.unit ? renderCodeText(test.unit).padEnd(2+longestUnitName.length) : ""}${test.referenceRange ? test.referenceRange.padEnd(2+longestReferenceRange.length) : ""}`) 
		];
}

let pathologyReportPdf = (documentObject) => {

	return new Promise((resolve, reject) => {
	
		

		const documentDetails = mapPathologyToCommonObjectMap(documentObject);
		
		let paperLayout = {
			header: {
				"leftColumn": [
					{key: "Patient", value: flattenName(documentDetails.patient.name)},
					{key: "Address", value: `${documentDetails.patient.addresses[0].streetAddressLine[0]}, ${documentDetails.patient.addresses[0].city}`},
					{key: "DOB", value: `${moment(documentDetails.patient.birthTime).format("DD-MMM-YYYY")}`},
					{key: "Sex", value: `${documentDetails.patient.sex.toUpperCase() === "M" ? "Male" : documentDetails.patient.sex.toUpperCase() === "F" ? "Female" : documentDetails.patient.sex}`},
					{key: "IHI", value: `${documentDetails.patient.ihi}`}
				],
				"middleColumn": [
					{key: "Referrer", value: flattenName(documentDetails.referrer.name)},
					{key: "Request Date", value: `${moment(documentDetails.referrerDateTime).format("DD-MMM-YYYY")}`}
				],
				"rightColumn": [
	//				{key: "Collected", value: `${documentDetails.specimen.collectionDate.format("DD-MMM-YYYY")}`},
	//				{key: "Reported", value: `${documentDetails.report.date.format("DD-MMM-YYYY")}`}
				]
			},
			reportText: "Redacted for example purposes."
		}

		let coordinates = {
			"leftColumn": 		{x: 7,y: 7},
			"middleColumn": 	{x: 220,y: 7},
			"rightColumn": 		{x: 420,y: 7},
			"content":			{x: 20,y: 180}
		};

		let alignments =  {
			keyValueSpacing:	75,
			lineSpacing: 		15,
			headerAdjustmint:	-3
		};

		const doc = new PDFDocument({autoFirstPage: false});


		let pdfBufferArray = [];

		const pdfStream = new Writable({
			write: (chunk, encoding, complete) => {

				pdfBufferArray.push(chunk);
				complete();

			},
			finish: (chunk, encoding, callback) => console.log("finish", chunk, encoding, callback),
			final: (callback) => {
				try {
					resolve(Buffer.concat(pdfBufferArray));

				} catch (e){
					reject(e);
				}
				callback();
			},
			destroy: (chunk, encoding, callback) => console.log("destroy", chunk, encoding, callback),
			

		});

		//doc.pipe(fs.createWriteStream('output.pdf'));
		doc.pipe(pdfStream);



		let page = doc.addPage({size: "A4" , margin: {top: 1, bottom: -5, left: 0, right: 1}} )
		.rect(05, 05, 585, 100)
		.fill('#eee')
		.fillColor('black');



		if (paperLayout.reportText){
			page.font('Courier').fontSize(12)
			.text(paperLayout.reportText, coordinates.content.x, coordinates.content.y);
		}



		Object.keys(paperLayout.header).forEach(column => {
			paperLayout.header[column].forEach((field, index) => {

				if (field) {
					if (index === 0){	//top of each column is bolded
						page.font('pdf/fonts/opensans/ttfs/OpenSans-Bold.ttf').fontSize(15)
						.text(`${paperLayout.header[column][index].key}:`, coordinates[column].x, coordinates[column].y  + alignments.headerAdjustmint + (alignments.lineSpacing * index+1) , {lineBreak: false})
						.text(`${paperLayout.header[column][index].value}`, coordinates[column].x + alignments.keyValueSpacing, coordinates[column].y + alignments.headerAdjustmint + (alignments.lineSpacing * index+1) , {lineBreak: false} )
				
					}else{				//the other columns have no bolding
						page.font('pdf/fonts/opensans/ttfs/OpenSans-Regular.ttf').fontSize(10)
						.text(`${paperLayout.header[column][index].key}:`, coordinates[column].x, coordinates[column].y+ (alignments.lineSpacing * index+1), {lineBreak: false} )
						.text(`${paperLayout.header[column][index].value}`, coordinates[column].x + alignments.keyValueSpacing, coordinates[column].y+ (alignments.lineSpacing * index+1), {lineBreak: false} )
					}
				}
			});
		});

		page.rect(05, doc.page.height - 105, 585, 100)
		.fill('#E5E5E5');

		page.font("Times-Roman")
		.fill('black')
		.text(`Please speak with the requesting doctor about your results.`, 8, doc.page.height - 100, {
			lineBreak: true
		})
		.text('If you wish to know more about pathology tests, please see Lab Tests Online', {link: "https://www.labtestsonline.org.au/"})

		doc.end();
		
	});

}

module.exports = pathologyReportPdf;
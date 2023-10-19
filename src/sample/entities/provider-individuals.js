let examplePharmacist = {
	type: {displayName: "Hospital Pharmacist", code: "251511"},
	addresses: [
		{
			type: "Australian",
			use: "WP",
			country: "Australia",
			state: "NSW",
			city: "Sydney",
			postalCode: "5555",
			streetAddressLine:["1 Clinician Street"],
			additionalLocator:"Level 2"
		}
	],
	electronicCommunincation: [{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	},{
		use: "WP",
		detail: "authen@globalauthens.com",
		type: "email"
	}],
	name: [
		{
			user: "L",
			family:"Farman",
			given:["Philip", "James"],
			prefix:["Mr"],
			suffix:["II"],
		}
	],
	hpii: "8003619166674595",
	qualifications: [
		{originalText: "B.Pharm" },
		{originalText: "B.S." },
	]
};


let JOHNYANG = {
	type: {displayName: "General Practitioner", codeSystem: "2.16.840.1.113883.13.62",code: "253111", codeSystemName: "1220.0 - ANZSCO - Australian and New Zealand Standard Classification of Occupations, First Edition, Revision 1"},
	name: [
		{
			user: "L",
			family:"Yang",
			given:["John"],
			prefix:["Dr"],
			suffix:["Jnr"],
		}
	],
};


let JAMESFARMAN = {
	type: {displayName: "Pathologist", code: "253915"},
	addresses: [
		{
			type: "Australian",
			use: "WP",
			country: "Australia",
			state: "NSW",
			city: "Sydney",
			postalCode: "5555",
			streetAddressLine:["1 Clinician Street"],
			additionalLocator:"Level 2"
		}
	],
	electronicCommunincation: [{
		use: "WP",
		detail: "0345754566",
		type: "phone"
	},{
		use: "WP",
		detail: "authen@globalauthens.com",
		type: "email"
	}],
	name: [
		{
			user: "L",
			family:"Farman",
			given:["Philip", "James"],
			prefix:["Dr"],
			suffix:["II"],
		}
	],
	hpii: "8003619166674595",
	qualifications: [
		{originalText: "M.B.B.S." },
		{originalText: "B.S." },
	]
};

module.exports = {
	pharmacist: [
		examplePharmacist
	],
	generalPractitioner: [
		JOHNYANG
	],
	pathologist: [
		JAMESFARMAN
	],
	radiologist: [
		Object.assign(JAMESFARMAN, {type: {displayName: "Diagnostic and Interventional Radiologist", code: "253917"}})
	]
}

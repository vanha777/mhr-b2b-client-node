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
let FRANKHARDING = {
	sex:"M", 
	'ihi': "8003608666701594",
	medicareCard: {
		number: "11111111",
		validFrom: "20170216160216+1000",
		validTo:"20170216160216+1000"
	},

	addresses: [{
		type: "Australian",
		use: "H",
		country: "Australia",
		state: "NSW",
		city: "Sydney",
		postalCode: "5555",
		streetAddressLine:["1 Clinician Street"],
		additionalLocator:"Level 3"
	},
	{
		type:"Overseas",
		use: "H",
		country: "New Caledonia",
		state: "New Caledonia",
		postalCode: "98800",
		streetAddressLine: "17 Route du Port Despointes"  
	}],
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
			family:"Harding",
			given:["Frank", "Troy"],
			prefix:"Mr",
			suffix:"II",
		}
	],
	administrativeGender: "M",
	birthTime: "1960-02-16 16:02:16+1000",
	ethnicGroupCode: "Neither Aboriginal nor Torres Strait Islander origin",
	deceasedTime: "20170216",
	birthplace: {
		type: "Australian",
		use: "H",
		country: "Australia",
		state: "NSW",
		city: "Sydney",
		postalCode: "5555",
		streetAddressLine:["1 Patient Street"],
		additionalLocator:"Unit 2"
	}
}

module.exports = {
	FRANKHARDING
};
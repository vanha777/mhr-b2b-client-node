const fur 		= require('fur');
const crypto	= require('crypto');


let generateLogo = (organisation, format) => { 
	let hash = crypto.createHash('sha256');
	
	hash.update(organisation.name);
	console.log(hash.copy().digest('hex'));

}

module.exports = {
	generateLogo
};
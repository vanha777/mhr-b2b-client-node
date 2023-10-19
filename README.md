# Project

This is a software library that provides an example implementation of how to connect 
up to the My Health Record Web Services client using promised based node.js.
This library was origianlly designed for generating semi-dynamic test data and is not designed for production use.

Disclaimer
==========
Library is still in developement and is not suitable for production enviroments.

Setup
=====
- To install the package dependencies run npm install
- Note this library has a dependency on [libxmljs](https://github.com/libxmljs/libxmljs#requirements) which requires (node-gyp)[https://github.com/nodejs/node-gyp#installation] to be installed.

Certificate Setup
=================
This library requires the test NASH certificates to be converted to PEM format. This is best done with OpenSSL using the following commands:

openssl pkcs12 -in fac_sign.p12 -out fac_sign_nash_org_with_attributes.public.pem -clcerts -nokeys -passin pass:Pass-123
openssl pkcs12 -in fac_sign.p12 -out fac_sign_nash_org_with_attributes.private.pem -nocerts -nodes -passin pass:Pass-123
openssl x509 -in fac_sign_nash_org_with_attributes.public.pem -out fac_sign_nash_org.public.pem

and then copy the test certificates to the sample/entities/certificates directory. Also remove any of the attributes statements in the PEM files, so that the -----BEGIN XXXXXXX----- is on the top line.

todo: include instructions to import CA trust chain and disable  rejectUnauthorized: false in the soap.js file


- Update sample/entities/certificates/product/index.js with product details.
- Update sample/entities/certificates/organisations/index.js with product details.


Solution
========
The solution consists of several projects, with the main feature project is the my health record project. 
This project contains the code to communicate with the my health record.


Library Usage
=============
Documentation can be found in the sample project.


To do
=====
- More Filtering options on the getDocumentListWebService
- Implement Remove Document
- Implement More robust MIME-Multipart support for MTOP/XOP
- Wider support to upload more document types
- Filter Document based views (Docu-views) from Document List
- Permit date filters as a paramater for the getView Service
- replace momentjs with date-fns and replace request.js with supported HTTPS client.
- Support HRO
- Support client choosing response type for views (Giving devs option of XML response enables them to use stylesheet)


Licensing
=========
See [LICENSE](LICENSE.txt) file.
/*
 * Copyright 2020 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const oFunctions = require("./functions.js");

(async function main() {
	const params = process.argv.slice(2)
	if(params.length >= 1) {
		const cn = params[0]
		const existingArn = params.length > 1 ? params[1] : undefined;
		
		console.log("Generating a certificate for common name and using existing ARN", cn, existingArn)
		
		const sRoleId = await oFunctions.getRoleId();
		const sSecretId = await oFunctions.getSecretId();

		const authTokenRes = await oFunctions.hashiAuth(sRoleId, sSecretId)
		const clientToken = authTokenRes.client_token;

		console.log("Hashicorp Auth Token", clientToken)

		console.log("Generating Key Pair")
		const keyPair = await oFunctions.generateKeyPair()
		console.log(keyPair)
		
		console.log("Generating CSR")
		const csr = oFunctions.generateCsrPem(keyPair, cn)
		console.log(csr)

		console.log("Signing the CSR:\n")

		const signRes = await oFunctions.signCSR(csr, cn, clientToken)
		console.log("CA CHAIN:\n", signRes.data.ca_chain.join("\n"))
		console.log("\nSigned CERTIFICATE:\n", signRes.data.certificate)
		
		console.log("Importing certificate")
		
		const importRes = await oFunctions.importCert(signRes.data.certificate, keyPair.privateKeyPem, signRes.data.ca_chain.join("\n"), existingArn);
		const importedArn = importRes.CertificateArn;
		
		console.log("Imported cert ARN", importedArn)
		
	} else {
		console.log("Usage: node app.js commonName [existingCertARN]")
	}
	

})()


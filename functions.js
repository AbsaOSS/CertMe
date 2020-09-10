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

const AWS = require('aws-sdk');
const RSA = require('rsa-compat').RSA;
const rp = require('request-promise');

const oPath = require('path');
const config = require( oPath.resolve( __dirname, "./config.js" ) );

const acm = new AWS.ACM();
const ssm = new AWS.SSM();

async function hashiAuth(sRoleId, sSecretId) {
  var options = {
      method: 'POST',
      uri: `${config.hashicorpVaultServer}/v1/auth/approle/login`,
      strictSSL: false,
      body: {
        "role_id": sRoleId,
        "secret_id": sSecretId 
      },
      json: true
  };

  return rp(options)
  .then(function (parsedBody) {  
    return parsedBody.auth;
  })
  .catch(function (err) {
    console.log(err)
  });
}

async function signCSR(csr, cn, token) {
  var options = {
      method: 'POST',
      uri: `${config.hashicorpVaultServer}/v1/${config.mountPoint}`,
      strictSSL: false,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        "csr": csr,
        "common_name": cn,
      },
      json: true
  };

  return rp(options)
}

async function importCert(sCert, sPrivateKey, sCAChain, sCertArn) {

  const params = {
      Certificate: Buffer.from(sCert),
      PrivateKey: Buffer.from(sPrivateKey),
      CertificateChain: Buffer.from(sCAChain),
  };

  if(sCertArn) {
    params.CertificateArn = sCertArn;
  }

  return acm.importCertificate(params).promise();
}

async function getSSMSecretString(sName) {

  console.log("Getting the value of secret parameter", sName)

  var params = {
    Name: sName, 
    WithDecryption: true
  };

  return ssm.getParameter(params).promise().then((oRes) => {
    return oRes.Parameter.Value
  });
}

function getRoleId() {
  return getSSMSecretString(config.ssmRoleIdParameterName)
}
function getSecretId() {
  return getSSMSecretString(config.ssmSecretIdParameterName)
}

async function generateKeyPair() {
  return new Promise(function(done){
    RSA.generateKeypair({
      certLength: config.certLength
    }, function (err, keypair) { 
      return done(keypair) 
    });
  })
}

function generateCsrPem(oKeyPair, sCn) {
  return RSA.generateCsrPem(oKeyPair, [ sCn ]);
}

async function generateAndImport(cn, existingArn){
  console.log("Generating a certificate for common name and using existing ARN", cn, existingArn)

  const sRoleId = await getRoleId();
  const sSecretId = await getSecretId();

  const authTokenRes = await hashiAuth(sRoleId, sSecretId)
  const clientToken = authTokenRes.client_token;

  console.log("Hashicorp Auth Token", clientToken)

  console.log("Generating Key Pair")
  const keyPair = await generateKeyPair()
  console.log(keyPair)

  console.log("Generating CSR")
  const csr = generateCsrPem(keyPair, cn)
  console.log(csr)

  console.log("Signing the CSR:\n")

  const signRes = await signCSR(csr, cn, clientToken)
  console.log("CA CHAIN:\n", signRes.data.ca_chain.join("\n"))
  console.log("\nSigned CERTIFICATE:\n", signRes.data.certificate)

  console.log("Importing certificate")

  const importRes = await importCert(signRes.data.certificate, keyPair.privateKeyPem, signRes.data.ca_chain.join("\n"), existingArn);
  const importedArn = importRes.CertificateArn;

  console.log("Imported cert ARN", importedArn)
  
  return new Promise(function(done){
    return done(importedArn)
  });
}

module.exports = {
    hashiAuth: hashiAuth,
    signCSR: signCSR,
    importCert: importCert,
    getSSMSecretString: getSSMSecretString,
    generateKeyPair: generateKeyPair,
    generateCsrPem: generateCsrPem,
    getRoleId: getRoleId,
    getSecretId: getSecretId,
    generateAndImport: generateAndImport,
}

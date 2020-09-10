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
const proxy = require('proxy-agent');

AWS.config.apiVersions = {
    acm: '2015-12-08'
};

AWS.config.update({
  httpOptions: { agent: proxy('http://your-proxy:8080') }
});

AWS.config.update({region: 'REPLACE-WITH-DESIRED-REGION'});

module.exports = {
    hashicorpVaultServer: "https://vault-nonprod.your-org.com",
    mountPoint: "certificate_authority/sign/your-vault-space",
    certLength: 2048,
    ssmRoleIdParameterName: "/yourAWSTeamCode/hashicorp-vault-role-id", // store the Hashicorp Role ID in the SSM Parameter Store as Secret String
    ssmSecretIdParameterName: "/yourAWSTeamCode/hashicorp-vault-secret-id" // store the Hashicorp Secret ID in the SSM Parameter Store as Secret String
}

## CertMe
A NodeJS tool to generate a key pair, a CSR locally, sign it using the HashiCorp Vault and import the signed certificate into AWS ACM

### Requirements
   - NodeJS
   - Access to the HashiCorp Vault (namely the role ID, secret ID, and the mount point)
   - Access to AWS SSM (Parameter Store) and permissions for ACM certificate import

### Build
Build by running `npm install`

### Configuration
Provide the following configuration options in config.js
   - *hashicorpVaultServer* - the base URL of the HashiCorp Vault server (e.g. https://vault.my-prod.com)
   - *mountPoint* - the URL mount point provided on the HashiCorp Vault (e.g. certificate_authority/sign/my-team)
   - *certLength* - the length of the certificate (e.g. 2048)
   - *ssmRoleIdParameterName* - the name of secret string parameter in SSM Parameter Store, which includes the Role ID (e.g. /myAWSTeam/myVaultRoleId)
   - *ssmSecretIdParameterName* - the name of secret string parameter in SSM Parameter Store, which includes the Secret ID (e.g. /myAWSTeam/myVaultSecretId)
   - *debug* - if set to true, the tool writes all outputs including the private key and the signed certificate into the console
   - Configure the desired AWS region
   - Configure the proxy

### How to run locally
   - Assumes valid AWS credentials stored in the default profile
   - Run with `node app.js commonName "[existingAcmCertArn]"`
       - Where commonName is the domain name of the cert to be signed
       - existingAcmCertArn - [OPTIONAL] specify this when re-importing or re-newing a cert

#### Information Returned
   - Hashicorp Auth Token
   - Keypair used to generate the CSR
   - Generated CSR in the PEM format
   - CA Chain of the signed certificate in the PEM format 
   - Signed certificate in the PEM format
   - The ARN of the (re-)imported ACM certificate

### How to run on Lambda
   - Run the build and specify the required configuration parameters in config.js
   - The zipped contents of the built project can be uploaded into Lambda through S3 or Terraform
   - Specify the Lambda handler as `lambda.handler`
   - Set a reasonable timeout, the average runtime on Lambda is 10s, 1 min timeout may be reasonable
   - Run using a Lambda execution role with `acm:ImportCertificate` and KMS permissions
   - The event object is expected in this format `{ "cn": "myapp.abc.com", "existingArn": "arn:aws:acm:eu-west-1:...."}`
        - Where existingArn is optional for certificate re-imports and renewals
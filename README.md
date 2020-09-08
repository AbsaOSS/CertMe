## CertAlready
A NodeJS tool to generate a key pair, a CSR locally, sign it using the HashiCorp Vault and import the signed certificate into AWS ACM

### Requirements
   - NodeJS
   - Access to the HashiCorp Vault (namely the role ID, secret ID, and the mount point)
   - Access to AWS SSM (Parameter Store) and permissions for ACM certificate import

### Build
Build by running `npm --save install`

### Configuration
Provide the following configuration options in config.js
   - *hashicorpVaultServer* - the base URL of the HashiCorp Vault server (e.g. https://vault.my-prod.com)
   - *mountPoint* - the URL mount point provided on the HashiCorp Vault (e.g. certificate_authority/sign/my-team)
   - *teamCode* - the AWS TeamCode, to be included as the cert tag (e.g. myAWSTeam)
   - *certLength* - the length of the certificate (e.g. 2048)
   - *ssmRoleIdParameterName* - the name of secret string parameter in SSM Parameter Store, which includes the Role ID (e.g. /myAWSTeam/myVaultRoleId)
   - *ssmSecretIdParameterName* - the name of secret string parameter in SSM Parameter Store, which includes the Secret ID (e.g. /myAWSTeam/myVaultSecretId)
   - Replace eu-west-1 with desired region

### How to run locally
   - Assumes valid AWS credentials stored in the default profile
   - Run with `node app.js commonName [existingAcmCertArn]`
       - Where commonName is the domain name of the cert to be signed
       - existingAcmCertArn - [OPTIONAL] specify this when re-importing or re-newing a cert
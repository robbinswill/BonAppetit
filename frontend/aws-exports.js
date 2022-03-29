import BonAppetitBackendStack from './cdk-exports.json'

const config = {
  Auth: {
    region: BonAppetitBackendStack.projectregion,
    userPoolId: BonAppetitBackendStack.userpoolid,
    userPoolWebClientId: BonAppetitBackendStack.userpoolclientid
  },
  aws_appsync_graphqlEndpoint: BonAppetitBackendStack.bonappetitapiendpoint,
  aws_appsync_region: BonAppetitBackendStack.projectregion,
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
}

export default config;
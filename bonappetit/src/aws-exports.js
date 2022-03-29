import BonAppetitBackendStack from './cdk-exports.json'

const config = {
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_CCzzINuiA",
    userPoolWebClientId: "2m2c218c3908rukd7c8sa43kbd"
  },
  aws_appsync_graphqlEndpoint: "https://t6muvvpwdzehpejmkkhya23tme.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
}

export default config;
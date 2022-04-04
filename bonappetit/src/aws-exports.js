import BonAppetitBackendStack from './cdk-exports.json'

const config = {
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_r4HmVe7QV",
    userPoolWebClientId: "7cskd7pouapt736dv49ellrao4"
  },
  aws_appsync_graphqlEndpoint: "https://dhl5c26cqvafrfpnwkyxahlham.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
}

export default config;
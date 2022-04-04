import BonAppetitBackendStack from './cdk-exports.json'

const config = {
  Auth: {
    region: "us-east-1",
    userPoolId: "us-east-1_N3dfOvhEI",
    userPoolWebClientId: "49a7b2sq48d7ahnbpuvd5c4utp"
  },
  aws_appsync_graphqlEndpoint: "https://awrqjlsd5jdhjiagqdzr5g7ili.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
}

export default config;
import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { AuthorizationType, FieldLogLevel, Schema, UserPoolDefaultAction } from '@aws-cdk/aws-appsync';


export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new cognito.UserPool(this, 'bonappetit-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    })

    const userPoolClient = new cognito.UserPoolClient(this, "bonappetit-userpool-client", {
      userPool
    })

    const api = new appsync.GraphqlApi(this, "bon-appetit-api", {
      name: "bon-appetit-app",
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: Schema.fromAsset('./graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
            defaultAction: UserPoolDefaultAction.ALLOW
          }
        }
      }
    })

    const urlTable = new ddb.Table(this, "bonappetit-url-table", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING
      }
    })

    const recipeTable = new ddb.Table(this, "bonappetit-recipe-table", {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING
      }
    })

    const urlLambda = new lambda.Function(this, "appsync-url-handler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'url.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      memorySize: 1024
    })

    const recipeLambda = new lambda.Function(this, "recipe-logic", {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'logic.handler',
      code: lambda.Code.fromAsset('lambda-functions'),
      memorySize: 1024
    })

    const urlLambdaDataSource = api.addLambdaDataSource("lambda-url-datasource", urlLambda)

    urlLambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createRecipeURL"
    })

    urlLambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "listRecipeURLs"
    })

    urlTable.grantFullAccess(urlLambda)
    urlLambda.addEnvironment("URL_TABLE", urlTable.tableName)

    recipeTable.grantFullAccess(recipeLambda)
    recipeLambda.addEnvironment("URL_TABLE", urlTable.tableName)
    recipeLambda.addEnvironment("RECIPE_TABLE", recipeTable.tableName)

    recipeLambda.addEventSource(new DynamoEventSource(urlTable, {
      startingPosition: lambda.StartingPosition.LATEST
    }))

    new cdk.CfnOutput(this, "user-pool-id", {
      value: userPool.userPoolId
    })

    new cdk.CfnOutput(this, "user-pool-client-id", {
      value: userPoolClient.userPoolClientId
    })

    new cdk.CfnOutput(this, "bonappetit-api-endpoint", {
      value: api.graphqlUrl
    })

    new cdk.CfnOutput(this, "project-region", {
      value: this.region
    })

  }
}
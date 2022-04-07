const AWS = require('aws-sdk')
const database = new AWS.DynamoDB.DocumentClient()


// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property
async function myRecipes(username: string) {
    const params = {
        TableName: process.env.URL_TABLE,
        IndexName: 'myRecipes',
        KeyConditionExpression: '#owner = :username',
        ExpressionAttributeNames: { '#owner': 'owner' },
        ExpressionAttributeValues: { ':username': username },
    }

    try {
        const recipeData = await database.query(params).promise()
        return recipeData.Items
    } catch (err) {
        console.log("Error with DynamoDB:")
        console.log(err)
        return null
    }
}

export default myRecipes
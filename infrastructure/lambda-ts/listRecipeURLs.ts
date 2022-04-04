const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()


async function listRecipeURLs() {
  const params = {
    TableName: process.env.URL_TABLE
  }
  try {
    const data = await docClient.scan(params).promise()
    return data.Items
  } catch (err) {
    console.log('DynamoDB error: ', err)
    return null
  }
}

export default listRecipeURLs
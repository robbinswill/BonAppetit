const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
import { v4 as uuid } from 'uuid'


async function createRecipeURL(inputUrl: string, username: string) {

  const recipeData = { id: uuid(), url: inputUrl, owner: username }
  const params = {
    TableName: process.env.URL_TABLE,
    Item: recipeData
  }
  try {
    await docClient.put(params).promise()
    return recipeData
  } catch (err) {
    console.log("DynamoDB error: ", err)
    return null
  }

}

export default createRecipeURL
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
import RecipeURL from "./RecipeURL"
import { v4 as uuid } from 'uuid'


async function createRecipeURL(request: RecipeURL, username: string) {

  if (!request.id) {
    request.id = uuid()
  }
  const recipeData = { ...request, owner: username }
  const params = {
    TableName: process.env.URL_TABLE,
    Item: recipeData
  }
  try {
    await docClient.put(params).promise()
    return request
  } catch (err) {
    console.log("DynamoDB error: ", err)
    return null
  }

}

export default createRecipeURL
const AWS = require('aws-sdk')
const database = new AWS.DynamoDB.DocumentClient()
import { v4 as uuid } from 'uuid'


async function createRecipe(inputUrl: string, username: string) {

  const recipeData = { id: uuid(), url: inputUrl, owner: username, title: null, ingredients: null, instructions: null }
  const params = {
    TableName: process.env.URL_TABLE,
    Item: recipeData
  }

  try {
    await database.put(params).promise()
    return recipeData
  } catch (err) {
      console.log("Error with DynamoDB:")
      console.log(err)
      return null
  }
}

export default createRecipe
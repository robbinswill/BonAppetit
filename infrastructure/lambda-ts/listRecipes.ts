const AWS = require('aws-sdk')
const database = new AWS.DynamoDB.DocumentClient()


async function listRecipes() {
  const params = {
    TableName: process.env.URL_TABLE
  }

  try {
    const recipeData = await database.scan(params).promise()
    return recipeData.Items
  } catch (err) {
      console.log("Error with DynamoDB:")
      console.log(err)
      return null
  }
}

export default listRecipes
import createRecipe from "./createRecipe";
import listRecipes from "./listRecipes";


type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    inputUrl: string
  },
  identity: {
    username: string
  }
}


exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "createRecipe":
      const { username } = event.identity
      return await createRecipe(event.arguments.inputUrl, username)
    case "listRecipes":
      return await listRecipes()
    default:
      return null
  }
}
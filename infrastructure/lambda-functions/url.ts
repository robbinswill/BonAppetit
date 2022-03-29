import RecipeURL from "./RecipeURL";
import createRecipeURL from "./createRecipeURL";
import listRecipeURLs from "./listRecipeURLs";


type AppSyncEvent = {
  info: {
    fieldName: string
  },
  arguments: {
    postId: string,
    request: RecipeURL
  },
  identity: {
    username: string
  }
}


exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "createRecipeURL":
      const { username } = event.identity
      return await createRecipeURL(event.arguments.request, username)
    case "listRecipeURLs":
      return await listRecipeURLs()
    default:
      return null
  }
}
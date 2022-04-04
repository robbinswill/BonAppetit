import createRecipeURL from "./createRecipeURL";
import listRecipeURLs from "./listRecipeURLs";


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
    case "createRecipeURL":
      const { username } = event.identity
      return await createRecipeURL(event.arguments.inputUrl, username)
    case "listRecipeURLs":
      return await listRecipeURLs()
    default:
      return null
  }
}
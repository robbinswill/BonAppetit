export const createRecipeURL = /* GraphQL */ `
  mutation CreateRecipeURL(
    $inputUrl: String!
  ) {
    createRecipeURL(inputUrl: $inputUrl) {
      id
      url
      owner
    }
  }
`
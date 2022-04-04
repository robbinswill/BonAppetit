export const createRecipe = /* GraphQL */ `
  mutation CreateRecipe(
    $inputUrl: String!
  ) {
    createRecipe(inputUrl: $inputUrl) {
      id
      url
      owner
      title
      ingredients
      instructions
    }
  }
`

export const listRecipes = /* GraphQL */ `
  query ListRecipes {
    listRecipes {
      title
      ingredients
      instructions
    }
  }
`

export const onCreateRecipe = /* GraphQL */ `
  subscription OnCreateRecipe {
    onCreateRecipe {
      title
      ingredients
      instructions
    }
  }
`
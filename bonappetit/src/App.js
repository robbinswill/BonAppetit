import logo from './logo.svg';
import './App.css';
import { v4 as uuid } from 'uuid';

import React, { useState, useEffect } from 'react';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { createRecipe, listRecipes } from './graphql';


const initialState = {inputUrl: ''}


function App() {

  const [newUrl, setNewUrl] = useState(initialState);
  const { inputUrl } = newUrl

  async function newRecipeURL() {
    if (!inputUrl) {
      return
    }

    console.log(newUrl)

    await API.graphql(graphqlOperation(createRecipe, newUrl))
    
    setNewUrl(initialState)
  }

  const [recipes, setRecipes] = useState([])

  async function fetchRecipes() {
    const recipeData = await API.graphql(graphqlOperation(listRecipes))
    setRecipes(recipeData.data.listRecipes)
  }

  const [user, updateUser] = useState(null)

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(user => updateUser(user))
      .catch(() => console.log("No signed in user..."))

    Hub.listen('auth', data => {
      switch (data.payload.event) {
        case 'signIn':
          return updateUser(data.payload.data)
        case 'signOut':
          return updateUser(null);
      }
    })

    fetchRecipes()
  }, [])
 
  if (user) {
    return (
      <div className="App">
        <h1>Submit a recipe URL here:</h1>
        <input
          onChange={e => setNewUrl({ ...newUrl, 'inputUrl': e.target.value })}
          name="inputUrl"
          placeholder="Recipe URL"
          value={newUrl.inputUrl}
        />
        <button onClick={newRecipeURL}>Submit recipe URL</button>
        <h1>Recipe card:</h1>
        {
          recipes.map((recipe) => (
            <div>
            <h2>{recipe.title}</h2>
            <h3>{recipe.ingredients}</h3>
            <h3>{recipe.instructions}</h3>
            </div>
          ))
        }
      </div>
    );
  }

  return (
    <AmplifyAuthenticator>
      <AmplifySignUp slot="sign-up"
        formFields={[
          { type: "username" },
          { type: "password" },
          { type: "email" }
        ]}
      />
    </AmplifyAuthenticator>
  )

}

export default App;

import logo from './logo.svg';
import './App.css';
import { v4 as uuid } from 'uuid';

import React, { useState, useEffect } from 'react';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import { createRecipeURL } from './graphql';


const initialState = {inputUrl: ''}


function App() {

  const [newUrl, setNewUrl] = useState(initialState);
  const { inputUrl } = newUrl

  async function newRecipeURL() {
    if (!inputUrl) {
      return
    }

    await API.graphql(graphqlOperation(createRecipeURL, newUrl))
    
    setNewUrl(initialState)
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

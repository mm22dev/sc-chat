import React from 'react'
import { render } from 'react-dom'
import { ApolloProvider } from 'react-apollo'
import ApolloClient from 'apollo-boost'
import { HashRouter } from 'react-router-dom'
import App from './components/App'

const target = document.getElementById('root')
const getTokenFromLocalStorage = () => {
  const localStorage = JSON.parse(window.localStorage.getItem('sc-chat-store'))
  return localStorage ? localStorage.currentUser.token : ''
}
const client = new ApolloClient({ 
  uri: 'http://localhost:5001/graphql',
  request: operation => 
    operation.setContext( () => ({
      headers: {
        "x-auth-token": getTokenFromLocalStorage()
      }
    }))
})

render(
  <ApolloProvider client={client}>
    <HashRouter>
      <App />
    </HashRouter>
  </ApolloProvider>,
  target
)

import React, { Component } from 'react'

const Context = React.createContext()

// @ desc   Provider for avoiding multiple auth user props injection
export class Provider extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      currentUser: null
    }
    this.updateCurrentUser = this.updateCurrentUser.bind(this)
  }

  componentDidMount() {
    // Get auth token from local storage and set to state
    const localStoragedData = JSON.parse(window.localStorage.getItem('sc-chat-store'))
    const { currentUser } = localStoragedData && localStoragedData.hasOwnProperty('currentUser') ? localStoragedData : this.state
    this.setState({ currentUser })
  }

  // @ desc   Method to be exposed by provider for updating auth user in localStorage
  updateCurrentUser(currentUser) {
    if(currentUser){
      window.localStorage.setItem('sc-chat-store', JSON.stringify({ currentUser }))
    }
    else{
      window.localStorage.removeItem('sc-chat-store')
    }
    this.setState({ currentUser })
  }

  render() {
    const { currentUser } = this.state
    
    return (
      <Context.Provider value={{ currentUser, updateCurrentUser: this.updateCurrentUser }}>
        {this.props.children}
      </Context.Provider>
    )
  }

}

// @ desc   HOC for connecting Components to Provider 
export const connectWithStore = Container =>
  class extends Component {
    render() {
      return <Context.Consumer>
        {(context) => <Container {...context} {...this.props} />}
      </Context.Consumer>
    }
  }

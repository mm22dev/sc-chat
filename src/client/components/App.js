import React from 'react'
import { Provider } from '../store'
import { Route, Switch } from 'react-router-dom'
import Home from './Home'
import AccountVerification from './auth/AccountVerification'
import Messages from './Messages'
import Whoops404 from './Whoops404'

const App = () =>
  <Provider>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route exact path='/verify/:username/:token' component={AccountVerification} />
      <Route exact path='/channel/:channelName/:channelId' component={Messages} />
      <Route component={Whoops404} />
    </Switch>
  </Provider>

export default App

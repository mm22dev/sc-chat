import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Menu, Button, Icon, Header } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'
import RegisterModal from '../auth/RegisterModal'
import LoginModal from '../auth/LoginModal'
import ProfileModal from '../auth/ProfileModal'
import { connectWithStore } from '../../store'

const MainMenu = connectWithStore(({ currentUser, updateCurrentUser }) => 
    <Menu secondary>
      <Menu.Menu>
        <NavLink to='/'>
          <Header as='h2' content='SC-CHAT'/>
        </NavLink>
      </Menu.Menu>
      <Menu.Menu position='right'>
        {
          currentUser
          ? <Fragment>
              <Button basic icon primary onClick={() => updateCurrentUser(null)}>
                <Icon name='sign out'></Icon> Logout
              </Button>
              <ProfileModal currentUser={currentUser.user} updateCurrentUser={updateCurrentUser}/>
            </Fragment>
          : <Fragment>
              <LoginModal updateCurrentUser={updateCurrentUser} />
              <RegisterModal />   
            </Fragment>
        }
      </Menu.Menu>
    </Menu>
)

MainMenu.propTypes = {
  token: PropTypes.string,
  updateToken: PropTypes.func
}

export default MainMenu

import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connectWithStore } from '../../store'
import { Modal, Button, Header, Container, Icon } from 'semantic-ui-react'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'
import AuthForm from './AuthForm'
import AuthNotification from './AuthNotification'

const accountUpdateMutation = gql`
  mutation accountUpdate($newName: String!, $newPassword: String!, $currentPassword: String!){
    updateUserAccount(newName: $newName, newPassword: $newPassword, currentPassword: $currentPassword){
      name
    }
  }
`

class ProfileModalUI extends Component {

  constructor(props) {
    super(props)
    this.state = {
      newName: this.props.currentUser.name || '',
      newPassword: '',
      currentPassword: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.updateCurrentUser = this.updateCurrentUser.bind(this)
    this.onMutationError = this.onMutationError.bind(this)
  }

  onInputChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value })
  }

  updateCurrentUser(data) {
    this.props.updateCurrentUser({
      token: this.props.currentUser.token,
      name: data.updateUserAccount.name
    })
  }

  onMutationError(error){
    if(isTokenMissingError(error)) this.props.updateCurrentUser(null)
  }

  render() {

    return (
      <Modal trigger={<Button basic icon primary><Icon name='user'></Icon> Account</Button>} basic size='small'>
        <Mutation 
          mutation={accountUpdateMutation} 
          variables={this.state} 
          onCompleted={this.updateCurrentUser}
          onError={this.onMutationError}
        >
          {
            (updateUserProfile, response) =>
              <Fragment>
                <Header content='Update Profile' />
                <Modal.Content>
                  {
                    response.data 
                    ? <AuthNotification
                        header='Profile updated'
                        content={`${response.data.updateUserAccount.name}, it's time to write new messages.`}
                      />
                    : <Container>
                        <AuthForm
                          authType='UPDATE'
                          storedName={this.state.newName}
                          onInputChange={this.onInputChange}
                          handleUserData={updateUserProfile}
                          mutationResponse={response}
                        />
                        {
                          response.called && response.error
                            ? <AuthNotification
                              header='Unable to update profile settings'
                              content={getGqlErrorMessage(response.error, this.props.updateCurrentUser)}
                            />
                            : null
                        }
                      </Container>
                  }
                </Modal.Content>
              </Fragment>
          }
        </Mutation>
      </Modal>

    )
  }

}

const ProfileModal = connectWithStore(ProfileModalUI)

ProfileModal.propTypes = {
  currentUser: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default ProfileModal
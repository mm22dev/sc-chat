import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Icon, Header, Container } from 'semantic-ui-react'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { getGqlErrorMessage } from '../../utils/lib'
import AuthForm from './AuthForm'
import AuthNotification from './AuthNotification'

const loginMutation = gql`
  mutation login($email: String!, $password: String!){
    login(email: $email, password: $password){
      token
      user{
        id
        name
      }
    }
  }
`

const pswRecoveryMutation = gql`
  mutation recoverPassword($email: String!){
    recoverPassword(email: $email)
  }
`

class LoginModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.storeCurrentUser = this.storeCurrentUser.bind(this)
  }

  onInputChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value })
  }

  storeCurrentUser(data) {
    this.props.updateCurrentUser({
      token: data.login.token,
      user: {
        id: data.login.user.id,
        name: data.login.user.name
      }
    })
  }

  render() {

    return (
      <Modal trigger={<Button basic icon primary><Icon name='sign in'></Icon> Login</Button>} basic size='small'>
        <Mutation mutation={loginMutation} variables={this.state} onCompleted={this.storeCurrentUser}>
          {
            (loginUser, response) =>
              <Fragment>
                <Header content='Login' />
                <Modal.Content>
                  {
                    <Container>
                      <AuthForm
                        authType='LOGIN'
                        onInputChange={this.onInputChange}
                        handleUserData={loginUser}
                        mutationResponse={response}
                      />
                      <Mutation mutation={pswRecoveryMutation} variables={{ email: this.state.email }}>
                        {
                          (recoverPassword, response) =>
                            <Container style={{ margin: '1em 0' }}>
                              <a href="#" onClick={response.called && response.loading ? f=>f : recoverPassword}>Forgot Password?</a>
                              { response.data ? <Header as='h4' color='green' content={response.data.recoverPassword} /> : null }
                              { response.error ? <Header as='h4' color='red' content={getGqlErrorMessage(response.error)} /> : null }
                            </Container>
                        }
                      </Mutation>
                      {
                        response.called && response.error
                          ? <AuthNotification
                            header='Unable to login'
                            content={getGqlErrorMessage(response.error)}
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

LoginModal.propTypes = {
  updateCurrentUser: PropTypes.func
}

export default LoginModal
import React, { Component, Fragment } from 'react'
import { Modal, Button, Icon, Header, Container } from 'semantic-ui-react'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { getGqlErrorMessage } from '../../utils/lib'
import AuthForm from './AuthForm'
import AuthNotification from './AuthNotification'

const registerUserMutation = gql`
  mutation register($name: String!, $email: String!, $password: String!){
    signUp(name: $name, email: $email, password: $password){
      name
    }
  }
`

class RegisterModal extends Component {

  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      password: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
  }

  onInputChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value })
  }

  render() {

    return (

      <Modal trigger={<Button basic icon primary><Icon name='user plus'></Icon> Register</Button>} basic size='small'>
        <Mutation mutation={registerUserMutation} variables={this.state}>
          {
            (registerUser, response) =>
              <Fragment>
                <Header content={response.data ? 'Successfully registered' : 'Register'} />
                <Modal.Content>
                  {
                    response.data 
                    ? <AuthNotification
                        header='One last step required'
                        content='A confirmation email has been sent to your e-mail address.'
                      />
                    : <Container>
                        <AuthForm
                          authType='SIGNUP'
                          onInputChange={this.onInputChange}
                          handleUserData={registerUser}
                          mutationResponse={response}
                        />
                        {
                          response.called && response.error
                            ? <AuthNotification
                              header='Unable to complete registration'
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

export default RegisterModal
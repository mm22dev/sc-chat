import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { getGqlErrorMessage } from '../../utils/lib'
import { Button, Container, Header, Icon } from 'semantic-ui-react'
import AuthNotification from '../auth/AuthNotification'

const verificationMutation = gql`
  mutation confirmRegistration($token: String!){
    confirmRegistration(token: $token){
      name
    }
  }
`

class AccountVerification extends Component {

  constructor(props) {
    super(props)
    this.returnToHomepage = this.returnToHomepage.bind(this)
  }

  returnToHomepage(){
    this.props.history.push('/')
  }

  render() {

    const { username, token } = this.props.match.params

    return <Mutation mutation={verificationMutation} variables={{ token }} onCompleted={this.returnToHomepage}>
      {
        (verifyUser, response) =>
          <Container textAlign='center' style={{ marginTop: 20 }}>
            <Header as='h1' icon>
              <Icon name='settings' />
            </Header>
            <Container textAlign='center' style={{ marginBottom: '1.5em' }}>
                <p>Account Verification</p>
                <p><b>{username}</b>, click the verification button to start your wonderful sc-chat experience</p>
              </Container>
            <Button
              content='Verify'
              primary
              onClick={verifyUser}
            />
            {
              response.called && response.error
                ? <AuthNotification
                  header='Unable to verify your Account'
                  content={getGqlErrorMessage(response.error)}
                />
                : null
            }
          </Container>
      }
    </Mutation>
  }

}

AccountVerification.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  staticContext: PropTypes.object
}

export default AccountVerification
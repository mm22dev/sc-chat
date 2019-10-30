import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connectWithStore } from '../../store'
import { Container, Header, Form, Message } from 'semantic-ui-react'
import { Mutation } from 'react-apollo'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'

class ChannelCreatorUI extends Component {

  constructor(props) {
    super(props)
    this.state = {
      channelName: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.emptyForm = this.emptyForm.bind(this)
    this.onMutationError = this.onMutationError.bind(this)
  }

  onInputChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value })
  }
  
  emptyForm() {
    this.setState({ channelName: '' })
  }

  onMutationError(error){
    if(isTokenMissingError(error)) this.props.updateCurrentUser(null)
  }

  render() {

    return (
      <Container style={{ margin: '50px 20px' }}>
        <Header content='Create a new Channel' />
        <Mutation 
          mutation={this.props.mutation} 
          variables={this.state}
          refetchQueries={[{query: this.props.refetchQuery}]}
          onCompleted={this.emptyForm}
          onError={this.onMutationError}
        >
          {
            (createChannel, response) =>
              <Fragment>
                <Form>
                  <Form.Group>
                    <Form.Input
                      name='channelName'
                      placeholder="Insert channel's name"
                      value={this.state.channelName}
                      onChange={this.onInputChange}
                    />
                    <Form.Button basic primary content='Create' onClick={createChannel} />
                  </Form.Group>
                </Form>
                {
                  response.called && response.error
                    ? <Message>
                      <Message.Header>Cannot create channel</Message.Header>
                      <p>{getGqlErrorMessage(response.error)}</p>
                    </Message>
                    : null
                }
              </Fragment>
          }
        </Mutation>
      </Container>
    )
  }
}

const ChannelCreator = connectWithStore(ChannelCreatorUI)

ChannelCreator.propTypes = {
  mutation: PropTypes.object,
  refetchQuery: PropTypes.object,
  currentUser: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default ChannelCreator

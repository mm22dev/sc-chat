import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connectWithStore } from '../../store'
import { Form, Button, Header } from 'semantic-ui-react'
import { Mutation } from 'react-apollo'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'

class MessageCreatorUI extends Component {

  constructor(props){
    super(props)
    this.state = {
      channelId: this.props.channelId,
      text: ''
    }
    this.onInputChange = this.onInputChange.bind(this)
    this.emptyForm = this.emptyForm.bind(this)
    this.onMutationError = this.onMutationError.bind(this)
  }

  onInputChange(ev) {
    this.setState({ [ev.target.name]: ev.target.value })
  }
  
  emptyForm() {
    this.setState({ text: '' })
  }

  onMutationError(error){
    if(isTokenMissingError(error)) this.props.updateCurrentUser(null)
  }

  render() {
    return (

      <Mutation 
        mutation={this.props.mutation}
        variables={this.state}
        refetchQueries={[{
          query: this.props.refetchQuery, 
          variables: { channelId: this.props.channelId } 
        }]}
        onCompleted={this.emptyForm}
        onError={this.onMutationError}
      >
        {
          (createMessage, response) => 
            <Fragment>
              <Form reply size='mini' style={{ padding: '3em 0' }}>
                {
                  response.called && response.error
                    ? <Header as='h5' color='red' content={getGqlErrorMessage(response.error)} />
                    : null
                }
                <Form.TextArea name='text' value={this.state.text} onChange={this.onInputChange} />
                <Button loading={response.loading} basic content='Comment' labelPosition='left' icon='edit' primary onClick={createMessage}/>
              </Form>
            </Fragment>
          
        }
      </Mutation>
      
    )
  }

}

const MessageCreator = connectWithStore(MessageCreatorUI)

MessageCreator.propTypes = {
  channelId: PropTypes.string,
  mutation: PropTypes.object,
  refetchQuery: PropTypes.object,
  currentUser: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default MessageCreator
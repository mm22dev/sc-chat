import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { gql } from 'apollo-boost'
import { Mutation } from 'react-apollo'
import { Comment, Button, Modal, Icon, Header } from 'semantic-ui-react'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'
import { connectWithStore } from '../../store'

const deleteMessageMutation = gql`
  mutation deleteOwnMessage($messageId: String!){
    deleteOwnMessage(messageId: $messageId){
      id
    }
  }
`

class MessageEliminatorUI extends Component {

  constructor(props) {
    super(props)
    this.state = {
      modalOpen: false
    }
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.onMutationError = this.onMutationError.bind(this)
  }

  handleOpen() {
    this.setState({ modalOpen: true })
  }

  handleClose() {
    this.setState({ modalOpen: false })
  }

  onMutationError(error){
    if(isTokenMissingError(error)) this.props.updateCurrentUser(null)
  }

  render() {
    return (
      <Mutation
        mutation={deleteMessageMutation}
        variables={{ messageId: this.props.messageId }}
        refetchQueries={[{
          query: this.props.refetchQuery,
          variables: { channelId: this.props.channelId }
        }]}
        onError={this.onMutationError}
      >
        {
          (deleteMessage, response) =>

            <Modal
              trigger={<Comment.Action onClick={this.handleOpen} style={{ cursor: 'pointer' }}>Delete</Comment.Action>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
              basic
              size='small'
            >
              <Modal.Content>
                <Header inverted as='h3' content={`Are you sure you want to delete message?`} />
                {
                  response.called && response.error
                    ? <Header as='h5' color='red' content={getGqlErrorMessage(response.error)} />
                    : null
                }
              </Modal.Content>
              <Modal.Actions>
                <Button basic inverted onClick={deleteMessage} >
                  <Icon name='checkmark' /> Yes
                        </Button>
                <Button basic inverted onClick={this.handleClose} >
                  <Icon name='close' /> No
                        </Button>
              </Modal.Actions>
            </Modal>
        }
      </Mutation>
    )
  }

}

const MessageEliminator = connectWithStore(MessageEliminatorUI)

MessageEliminator.propTypes = {
  channelId: PropTypes.string,
  messageId: PropTypes.string,
  refetchQuery: PropTypes.object,
  currentUser: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default MessageEliminator

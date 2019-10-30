import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connectWithStore } from '../../store'
import { gql } from 'apollo-boost'
import { Mutation } from 'react-apollo'
import { Button, Modal, Icon, Header } from 'semantic-ui-react'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'

const deleteChannel = gql`
  mutation deleteChannel($channelId: String!){
    deleteChannel(channelId: $channelId){
      name
    }
  }
`

class ChannelEliminatorUI extends Component {

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

    const { channelId } = this.props

    return (
      <Mutation
        mutation={deleteChannel}
        variables={{ channelId }}
        refetchQueries={[{ query: this.props.refetchQuery }]}
        onError={this.onMutationError}
      >
        {
          (deleteChannel, response) =>
            <Modal
              trigger={<Button basic color='red' onClick={this.handleOpen}>Delete</Button>}
              open={this.state.modalOpen}
              onClose={this.handleClose}
              basic
              size='small'
            >
              <Modal.Content>
                <Header inverted as='h3' content={`Are you sure you want to delete ${name}?`} />
                {
                  response.called && response.error
                    ? <Header as='h5' color='red' content={getGqlErrorMessage(response.error)} />
                    : null
                }
              </Modal.Content>
              <Modal.Actions>
                <Button basic inverted onClick={deleteChannel} >
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

const ChannelEliminator = connectWithStore(ChannelEliminatorUI)

ChannelEliminator.propTypes = {
  channelId: PropTypes.string,
  refetchQuery: PropTypes.object,
  currentUser: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default ChannelEliminator

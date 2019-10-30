import React from 'react'
import PropTypes from 'prop-types'
import { gql } from 'apollo-boost'
import PageTemplate from '../_common/PageTemplate'
import { Comment, Header, Container } from 'semantic-ui-react'
import MessageList from './MessageList'
import MessageCreator from './MessageCreator'

const messageListQuery = gql`
  query listChannelMessages($channelId: String!){
    listChannelMessages(channelId: $channelId){
      id
      content
      writtenBy {
        name
      }
      writtenAt
    }
  }
`

const createMessageMutation = gql`
  mutation createMessage($channelId: String!, $text: String!){
    createMessage(channelId: $channelId, text: $text){
      id
    }
  }
`

const Messages = ({ match }) => {

  const { channelId, channelName } = match.params

  return (

    <PageTemplate>
      <Comment.Group style={{ height: '85%' }}>
        <Header as='h1' dividing content={channelName} />
        <Container style={{ height: '60%', overflow: 'auto'}}>
          <MessageList 
            channelId={channelId} 
            messageListQuery={messageListQuery} 
          />
        </Container>
        <Container style={{ height: '40%'}}>          
          <MessageCreator 
            channelId={channelId} 
            mutation={createMessageMutation} 
            refetchQuery={messageListQuery}
          />
        </Container>
      </Comment.Group>
    </PageTemplate>

  )
}

Messages.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  staticContext: PropTypes.object
}

export default Messages
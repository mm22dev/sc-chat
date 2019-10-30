import React from 'react'
import PropTypes from 'prop-types'
import { connectWithStore } from '../../store'
import { Query } from 'react-apollo'
import { Dimmer, Loader, Container, Header } from 'semantic-ui-react'
import Message from './Message'
import { getGqlErrorMessage, isTokenMissingError } from '../../utils/lib'

const MessageList = connectWithStore(
  
  ({ channelId, messageListQuery, updateCurrentUser }) => {

    const Loading = () => 
      <Container>      
        <Dimmer active>
          <Loader inverted>Loading Messages</Loader>
        </Dimmer>
      </Container>

    const NoMessageFound = () => 
      <Container style={{ margin: 50 }}>
        <p>No message found</p>
        <p>Be the first to write in this channel</p>
      </Container>

    const Error = ({ err }) =>
      <Container style={{ margin: 50 }}>
        <Header as='h3' color='red' content={getGqlErrorMessage(err)} />
      </Container>

    const onQueryError = error => {
      if(isTokenMissingError(error)) updateCurrentUser(null)
    }

    return (
      
      <Query 
        query={messageListQuery} 
        variables={{channelId}} 
        onError={onQueryError}
      >
      {
        response => !response.called 
          ? <Loading />
          : response.loading
            ? <Loading />
            : response.error
              ? <Error err={response.error}/>
              : !response.data.listChannelMessages
                ? <Loading />
                : response.data.listChannelMessages.length===0
                  ? <NoMessageFound />
                  : response.data.listChannelMessages.map(message => <Message key={message.id} channelId={channelId} messageListQuery={messageListQuery} messageData={message} />)
      }
      </Query>
      
    )

  }
)

MessageList.propTypes = {
  channelId: PropTypes.string,
  messageListQuery: PropTypes.object,
  updateCurrentUser: PropTypes.func
}

export default MessageList

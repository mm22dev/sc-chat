import React from 'react'
import PropTypes from 'prop-types'
import { Comment } from 'semantic-ui-react'
import MessageEliminator from './MessageEliminator'

const Message = ({ channelId, messageListQuery, messageData }) => {

  const { id, writtenBy, writtenAt, content } = messageData

  return (

    <Comment>
      <Comment.Content>
        <Comment.Author>{writtenBy.name}</Comment.Author>
        <Comment.Metadata>
          <div>{writtenAt}</div>
        </Comment.Metadata>
        <Comment.Text>{content}</Comment.Text>
        <MessageEliminator channelId={channelId} messageId={id} refetchQuery={messageListQuery} />
      </Comment.Content>
    </Comment>

  )

}
Message.propTypes = {
  channelId: PropTypes.string,
  messageListQuery: PropTypes.object,
  messageData: PropTypes.object
}

export default Message

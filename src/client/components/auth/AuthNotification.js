import React from 'react'
import PropTypes from 'prop-types'
import { Message } from 'semantic-ui-react'

const AuthNotification = ({ header, content }) => 
  <Message>
    <Message.Header>{header}</Message.Header>
    <p>{content}</p>
  </Message>

AuthNotification.propTypes = {
  header: PropTypes.string,
  content: PropTypes.string
}

export default AuthNotification

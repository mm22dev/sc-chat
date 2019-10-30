import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'semantic-ui-react'
import MainMenu from './MainMenu'

const PageTemplate = ({ children }) => 
  <Container style={{ height: '100%', padding: 20 }}>
    <MainMenu />
    { children } 
  </Container>

PageTemplate.propTypes = {
  children: PropTypes.object.isRequired
}

export default PageTemplate

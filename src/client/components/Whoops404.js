import React from 'react'
import { Container, Header, Icon } from 'semantic-ui-react'

const Whoops404 = () =>
  <Container textalign='center' style={{ marginTop: 200 }}>
    <Header as='h1' icon textAlign='center'>
      <Icon name='puzzle' />
      Page not found
    </Header>
  </Container>

export default Whoops404

import React from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Header } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'
import ChannelEliminator from './ChannelEliminator'

const Channel = ({ channelData, channelListQuery }) => {

  const { id, name, createdBy, createdAt, accessibility } = channelData

  return (
    <Card>
      <Card.Content>
        <Card.Header textAlign='right'>
          <Header as='h5' color={accessibility === 'PUBLIC' ? 'green' : 'yellow'}>
            {accessibility}
          </Header>
        </Card.Header>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>Created by <b>{createdBy.name}</b></Card.Meta>
        <Card.Meta>{createdAt}</Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className='ui two buttons'>
          <Button basic color='blue'>
            <NavLink to={`/channel/${name}/${id}`} style={{ color: '#2185d0' }}>
              Enter
            </NavLink>
          </Button>
          <ChannelEliminator channelId={id} refetchQuery={channelListQuery} />
        </div>
      </Card.Content>
    </Card>
  )

}

Channel.propTypes = {
  channelData: PropTypes.object,
  channelListQuery: PropTypes.object
}

export default Channel

import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { Container, Loader, Dimmer, Header, Card } from 'semantic-ui-react'
import Channel from './Channel'
import { getGqlErrorMessage } from '../../utils/lib'

const ChannelList = ({ channelListQuery }) => {

  const Loading = () => 
    <Container>      
      <Dimmer active>
        <Loader inverted>Loading Messages</Loader>
      </Dimmer>
    </Container>

  const NoChannelFound = () => 
    <Container style={{ margin: 50 }}>
      <p>No channel found</p>
      <p>Start creating a new channel</p>
    </Container>

  const Error = ({ err }) =>
    <Container style={{ margin: 50 }}>
      <Header as='h3' color='red' content={getGqlErrorMessage(err)} />
    </Container>

  return (

    <Container style={{ margin: 20 }}>
        <Query query={channelListQuery}>
        {
          response => !response.called 
          ? <Loading />
          : response.loading
            ? <Loading />
            : response.error
              ? <Error err={response.error} />
              : !response.data.listChannels
                ? <Loading />
                : response.data.listChannels.length===0
                  ? <NoChannelFound />
                  : <Card.Group centered stackable>
                    { response.data.listChannels.map(channel => <Channel key={channel.id} channelListQuery={channelListQuery} channelData={channel} />) }
                  </Card.Group>
        }
        </Query>
      </Container>

  )
  
}
ChannelList.propTypes = {
  channelListQuery: PropTypes.object
}

export default ChannelList

import React from 'react'
import { gql } from 'apollo-boost'
import { Container } from 'semantic-ui-react'
import ChannelCreator from './ChannelCreator'
import ChannelList from './ChannelList'

const createChannelMutation = gql`
  mutation createChannel($channelName: String!){
    createChannel(channelName: $channelName){
      name
    }
  }
`

const channelListQuery = gql`
  query listChannels{
    listChannels {
      id
      name
      authorId
      createdBy{
        id
        name
      }
      createdAt
      accessibility
    }
  }
`

const Channels = () => 
  <Container>
    <ChannelCreator 
      refetchQuery={channelListQuery} 
      mutation={createChannelMutation}  
    />
    <ChannelList channelListQuery={channelListQuery} />    
  </Container>

export default Channels

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import PageTemplate from './_common/PageTemplate'
import Channels from './Channels'

const Home = () =>
  <PageTemplate>
    <Channels />
  </PageTemplate>

Home.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  staticContext: PropTypes.object
}

export default Home

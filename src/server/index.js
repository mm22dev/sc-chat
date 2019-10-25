const express = require('express')
const { connectToMongoDB } = require('./utils/lib')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const resolvers = require('./resolvers')

const startServer = async () => {
  const app = express()

  await connectToMongoDB()

  const typeDefs = readFileSync('./src/server/typeDefs.graphql', 'UTF-8')
  const apolloServer = new ApolloServer({
    typeDefs,
    /* resolvers */
  })

  apolloServer.applyMiddleware({app}) 

  app.get('/', (req, res) => res.status(200).send('Hello world'))

  app.listen({port: 5001}, () => {
    console.log('🚀 Server running on http://localhost:5001')
    console.log(`GraphQL Server running	at http://localhost:5001${apolloServer.graphqlPath}`)
  })
}

startServer()
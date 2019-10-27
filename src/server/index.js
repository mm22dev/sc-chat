const express = require('express')
const { connectToMongoDB, verifyAuthToken } = require('./utils/lib')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const resolvers = require('./resolvers')
const path = require('path')

const startServer = async () => {
  const app = express()

  await connectToMongoDB()

  const typeDefs = readFileSync('./src/server/schema/typeDefs.graphql', 'UTF-8')
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => verifyAuthToken(req.header('x-auth-token'))
  })
  
  apolloServer.applyMiddleware({app}) 

  app.use(express.static(path.join(__dirname, '/dist')))

  app.listen({port: 5001}, () => {
      console.log('🚀 Server running on http://localhost:5001')
      console.log(`GraphQL Server running at http://localhost:5001${apolloServer.graphqlPath}`)
  })
}

startServer()

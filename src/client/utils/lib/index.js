export const getGqlErrorMessage = error => {
  const errorMessage = error.toString().replace('Error: GraphQL error:', '').trim()
  return errorMessage
}

export const isTokenMissingError = error => getGqlErrorMessage(error)==='To perform this operation you must be authenticated' 
/** Parsed JSON body from Payload GraphQL HTTP responses */
export type GraphQLJsonBody<TData = unknown> = {
  data?: TData
  errors?: { message?: string }[]
}

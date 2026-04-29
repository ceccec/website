'use client'

import { ME_QUERY, USER } from '@data/me'
import {
  assertPayloadGraphQLMutationOk,
  parseForgotPasswordUserFromData,
  parseLoginUserFromData,
  parseMeUserFromData,
  parseResetPasswordUserFromData,
  parseUpdateUserFromData,
  readPayloadGraphQLResponse,
} from '@utilities/payloadCloudJson'
import React, { createContext, use, useCallback, useEffect, useRef, useState } from 'react'

import type { User } from '../../payload-cloud-types'

type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void>

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void>

type Login = (args: { email: string; password: string }) => Promise<User>

type Logout = () => Promise<void>

type AuthContext = {
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: null | User) => void
  updateUser: (user: Partial<User>) => Promise<void>
  user?: null | User
}

const Context = createContext({} as AuthContext)

const CLOUD_CONNECTION_ERROR = 'An error occurred while attempting to connect to Payload Cloud'

function cloudGraphqlUrl(): null | string {
  const base = process.env.NEXT_PUBLIC_CLOUD_CMS_URL?.trim()
  if (!base) {
    return null
  }
  return `${base.replace(/\/$/, '')}/api/graphql`
}

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<null | undefined | User>(undefined)
  const fetchedMe = useRef(false)

  const login = useCallback<Login>(async (args) => {
    try {
      const graphql = cloudGraphqlUrl()
      if (!graphql) {
        throw new Error('NEXT_PUBLIC_CLOUD_CMS_URL is not set.')
      }
      const res = await fetch(graphql, {
        body: JSON.stringify({
          query: `mutation {
              loginUser(email: "${args.email}", password: "${args.password}") {
                user {
                  ${USER}
                }
                exp
              }
            }`,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const envelope = await assertPayloadGraphQLMutationOk(res)
      const nextUser = parseLoginUserFromData(envelope.data)
      if (!nextUser) {
        throw new Error('Login succeeded but user payload did not match Payload users shape.')
      }
      setUser(nextUser)
      return nextUser
    } catch (e) {
      throw new Error(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
    }
  }, [])

  const logout = useCallback<Logout>(async () => {
    try {
      const graphql = cloudGraphqlUrl()
      if (!graphql) {
        setUser(null)
        return
      }
      const res = await fetch(graphql, {
        body: JSON.stringify({
          query: `mutation {
            logoutUser
          }`,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (res.ok) {
        setUser(null)
      } else {
        throw new Error('An error occurred while attempting to logout.')
      }
    } catch (e) {
      throw new Error(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
    }
  }, [])

  useEffect(() => {
    if (fetchedMe.current) {
      return
    }
    fetchedMe.current = true

    const fetchMe = async () => {
      // Payload Cloud GraphQL is a separate service; skip when not used locally (see .env.example).
      if (process.env.NEXT_PUBLIC_OMIT_CLOUD_ERRORS === 'true') {
        setUser(null)
        return
      }

      const graphql = cloudGraphqlUrl()
      if (!graphql) {
        setUser(null)
        return
      }

      try {
        const res = await fetch(graphql, {
          body: JSON.stringify({
            query: ME_QUERY,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        const envelope = await readPayloadGraphQLResponse(res)

        if (!res.ok) {
          const msg =
            envelope.errors?.[0]?.message || 'An error occurred while attempting to fetch user.'
          if (process.env.NEXT_PUBLIC_OMIT_CLOUD_ERRORS !== 'true') {
            console.warn(`${CLOUD_CONNECTION_ERROR}: ${msg}`)
          }
          setUser(null)
          return
        }

        if (envelope.errors?.length) {
          const msg = envelope.errors[0].message
          if (process.env.NEXT_PUBLIC_OMIT_CLOUD_ERRORS !== 'true') {
            console.warn(`${CLOUD_CONNECTION_ERROR}: ${msg}`)
          }
          setUser(null)
          return
        }

        setUser(parseMeUserFromData(envelope.data) ?? null)
      } catch (e) {
        setUser(null)
        if (process.env.NEXT_PUBLIC_OMIT_CLOUD_ERRORS !== 'true') {
          console.warn(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
        }
      }
    }

    void fetchMe()
  }, [])

  const forgotPassword = useCallback<ForgotPassword>(async (args) => {
    try {
      const graphql = cloudGraphqlUrl()
      if (!graphql) {
        throw new Error('NEXT_PUBLIC_CLOUD_CMS_URL is not set.')
      }
      const res = await fetch(graphql, {
        body: JSON.stringify({
          query: `mutation {
              forgotPasswordUser(email: "${args.email}") {
                user {
                  ${USER}
                }
                exp
              }
            }`,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const envelope = await assertPayloadGraphQLMutationOk(res)
      const nextUser = parseForgotPasswordUserFromData(envelope.data)
      if (nextUser) {
        setUser(nextUser)
      }
    } catch (e) {
      throw new Error(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
    }
  }, [])

  const resetPassword = useCallback<ResetPassword>(async (args) => {
    try {
      const graphql = cloudGraphqlUrl()
      if (!graphql) {
        throw new Error('NEXT_PUBLIC_CLOUD_CMS_URL is not set.')
      }
      const res = await fetch(graphql, {
        body: JSON.stringify({
          query: `mutation {
              resetPasswordUser(password: "${args.password}", token: "${args.token}") {
                user {
                  ${USER}
                }
              }
            }`,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const envelope = await assertPayloadGraphQLMutationOk(res)
      const nextUser = parseResetPasswordUserFromData(envelope.data)
      if (!nextUser) {
        throw new Error('Reset password succeeded but user payload did not match Payload users shape.')
      }
      setUser(nextUser)
    } catch (e) {
      throw new Error(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
    }
  }, [])

  const updateUser = useCallback(
    async (incomingUser: Partial<User>) => {
      try {
        if (!user || !incomingUser) {
          throw new Error('No user found to update.')
        }

        const graphql = cloudGraphqlUrl()
        if (!graphql) {
          throw new Error('NEXT_PUBLIC_CLOUD_CMS_URL is not set.')
        }
        const res = await fetch(graphql, {
          body: JSON.stringify({
            query: `mutation {
              updateUser(
                id: "${user?.id}",
                data: {
                  ${Object.entries(incomingUser)
                    .filter(([key, value]) => value !== undefined)
                    .map(([key, value]) => `${key}: "${value}"`)
                    .join(', ')}
                }
              ) {
                ${USER}
              }
            }`,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        const envelope = await assertPayloadGraphQLMutationOk(res)
        const nextUser = parseUpdateUserFromData(envelope.data)
        if (!nextUser) {
          throw new Error('Update succeeded but user payload did not match Payload users shape.')
        }
        setUser(nextUser)
      } catch (e) {
        throw new Error(`${CLOUD_CONNECTION_ERROR}: ${errMessage(e)}`)
      }
    },
    [user],
  )

  return (
    <Context
      value={{
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        updateUser,
        user,
      }}
    >
      {children}
    </Context>
  )
}

type UseAuth<T = User> = () => AuthContext

export const useAuth: UseAuth = () => use(Context)

import { Spinner } from '@components/Spinner/index'
import { Text } from '@forms/fields/Text/index'
import { CheckIcon } from '@root/icons/CheckIcon/index'
import { CloseIcon } from '@root/icons/CloseIcon/index'
import useDebounce from '@root/utilities/use-debounce'
import React, { useEffect, useState } from 'react'

import type { SlugValidationResult } from './reducer'

import classes from './index.module.scss'
import { stateReducer } from './reducer'

// checks Payload to ensure that the given slug is unique and ensures only the validated slug is used
// displays a success message if the slug is available, warns the user if the slug is taken
export const UniqueSlug: React.FC<{
  collection: 'projects' | 'teams'
  disabled?: boolean
  docId?: string
  initialValue?: string
  label?: string
  path?: 'createTeamFromSlug' | 'slug'
  teamId?: string
  validateOnInit?: boolean
}> = ({
  collection = 'teams',
  disabled = false,
  docId,
  initialValue,
  label = 'Slug',
  path = 'slug',
  teamId,
  validateOnInit = false,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const isRequesting = React.useRef(false)
  const [error, setError] = React.useState<null | string>(null)

  const [state, dispatchState] = React.useReducer(stateReducer, {
    slug: initialValue || '',
    isUnique: undefined,
    userInteracted: false,
  })

  const debouncedSlug = useDebounce(state.slug, 100)

  const currentSlug = React.useRef(initialValue || '')

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (!disabled && !isRequesting.current && (validateOnInit || state.userInteracted)) {
      isRequesting.current = true

      const slug = currentSlug.current

      if (!slug) {
        setError('Please input a slug')
        dispatchState({ type: 'SET_UNIQUE', payload: false })
        isRequesting.current = false
        return
      }

      if (debouncedSlug) {
        if (debouncedSlug.length < 3) {
          setError('The slug must be at least 3 characters long.')
          dispatchState({ type: 'SET_UNIQUE', payload: false })
          isRequesting.current = false
          return // Exit early to prevent the request from being sent
        }

        const slugRegex = /^[\w-]+$/
        if (!slugRegex.test(debouncedSlug)) {
          setError('The slug can only contain alphanumeric characters, hyphens, and underscores.')
          dispatchState({ type: 'SET_UNIQUE', payload: false })
          isRequesting.current = false
          return // Exit early to prevent the request from being sent
        }

        const validateSlug = async () => {
          // only show loading state if the request is slow
          // this will prevent flickering on fast networks
          timer = setTimeout(() => {
            setIsLoading(true)
          }, 200)

          setError(null)

          try {
            const validityReq = await fetch(
              `${process.env.NEXT_PUBLIC_CLOUD_CMS_URL}/api/validate-slug`,
              {
                body: JSON.stringify({
                  id: docId,
                  slug: debouncedSlug,
                  collection,
                  team: teamId,
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              },
            )

            clearTimeout(timer)

            if (validityReq.ok) {
              const newValidation: SlugValidationResult = await validityReq.json()
              dispatchState({ type: 'RESET', payload: newValidation })
            } else {
              const message =
                validityReq.status === 400
                  ? 'The slug can only contain alphanumeric characters, hyphens, and underscores.'
                  : `Error validating slug: ${validityReq.statusText}`
              console.error(message) // eslint-disable-line no-console
              setError(message)
              dispatchState({ type: 'SET_UNIQUE', payload: false })
            }
          } catch (e) {
            const message = `Error validating slug: ${e.message}`
            console.error(message) // eslint-disable-line no-console
            setError(message)
            dispatchState({ type: 'SET_UNIQUE', payload: false })
          }

          setIsLoading(false)
        }

        void validateSlug()
      }

      isRequesting.current = false
    }

    return () => {
      clearTimeout(timer)
    }
  }, [
    validateOnInit,
    state.userInteracted,
    debouncedSlug,
    collection,
    teamId,
    initialValue,
    docId,
    disabled,
  ])

  const validatedSlug = state?.slug
  const slugIsValid = validatedSlug && state?.isUnique
  const slugIsFetched = state?.fetched

  let description
  let isError = Boolean(error || !slugIsValid)

  if (!validateOnInit && !state.userInteracted) {
    description = ''
  } else if (!state.fetched && (validateOnInit || state.userInteracted)) {
    description = 'Checking slug availability...'
  } else if (!currentSlug.current) {
    description = 'Please input a slug'
    isError = true
  } else if (currentSlug.current.length < 3) {
    description = 'The slug must be at least 3 characters long.'
    isError = true
  } else if (error) {
    description = error
  } else if (!slugIsValid) {
    description = `'${currentSlug.current}' is not available. Please choose another.`
  } else if (slugIsValid) {
    description = `'${currentSlug.current}' is available`
  }

  let icon: React.ReactNode = null
  if (isLoading) {
    icon = <Spinner />
  }
  if (slugIsValid) {
    icon = <CheckIcon bold className={classes.check} size="medium" />
  }
  if (slugIsFetched && isError) {
    icon = <CloseIcon bold className={classes.error} size="medium" />
  }

  // two fields are rendered here, the first is controlled, user-facing and not debounced
  // the other is a hidden field that has been validated
  // this field is the only one that is we need sent through the form state
  return (
    <div className={classes.uniqueSlug}>
      <Text
        disabled={disabled}
        icon={icon}
        initialValue={initialValue}
        label={label}
        onChange={(newSlug) => {
          currentSlug.current = newSlug
          dispatchState({ type: 'SET_SLUG', payload: newSlug })
          dispatchState({ type: 'SET_USER_INTERACTED' })
        }}
        required
        showError={slugIsFetched && isError}
      />
      <Text
        initialValue={initialValue}
        path={path}
        readOnly={disabled}
        required
        type="hidden"
        value={validatedSlug}
      />
      {description && (
        <div
          className={[
            classes.description,
            slugIsFetched && isError && !isLoading && classes.error,
            slugIsValid && !isLoading && classes.success,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </div>
      )}
    </div>
  )
}

export const UniqueTeamSlug: React.FC<{
  initialValue?: string
  path?: 'createTeamFromSlug' | 'slug'
  readOnly?: boolean
  teamId?: string
}> = (props) => {
  const { initialValue, path = 'slug', readOnly, teamId } = props
  return (
    <UniqueSlug
      collection="teams"
      disabled={readOnly}
      docId={teamId}
      initialValue={initialValue}
      label="Team Slug"
      path={path}
    />
  )
}

export const UniqueProjectSlug: React.FC<{
  disabled?: boolean
  initialValue?: string
  projectId?: string
  teamId?: string
  validateOnInit?: boolean
}> = ({ disabled: readOnly, initialValue, projectId, teamId, validateOnInit }) => {
  return (
    <UniqueSlug
      collection="projects"
      disabled={readOnly}
      docId={projectId}
      initialValue={initialValue}
      label="Project Slug"
      path="slug"
      teamId={teamId}
      validateOnInit={validateOnInit}
    />
  )
}

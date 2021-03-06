import fetchWithRetry from 'fetch-retry'
import set from 'lodash/set'
import get from 'lodash/get'
import { checkStatus } from 'utils'
import { SubmissionError } from 'redux-form';
import { transform, transformFullSubmission, SERVER_FIELD_TO_FRONTEND_FIELD } from './transform'
import {
  frontendMessageByErrorCode,
  DUPLICATE_APPLICATION_MESSAGE
} from './validation-messages'

const getBaseUrl = () => {
  return window.location.protocol + '//' + window.location.host;
}

const getConfirmationSuccessUrl = () => {
  return getBaseUrl() + '/register-my-baby/confirmation';
}

const getConfirmationPaymentSuccessUrl = () => {
  return getBaseUrl() + '/register-my-baby/confirmation-payment-success';
}

const getConfirmationPaymentFailureUrl = () => {
  return getBaseUrl() + '/register-my-baby/confirmation-payment-retry';
}

const toReduxFormSubmissionError = (json) => {
  const consumableError = {}
  const statusCode = get(json, 'error.statusCode')
  const duplicate = get(json, 'error.duplicate')
  const errors = get(json, 'error.errors', [])

  if (statusCode === 400) {
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        let frontendMessage = frontendMessageByErrorCode[error.code] || frontendMessageByErrorCode[`${error.code}:${error.field}`]
        let frontendField = SERVER_FIELD_TO_FRONTEND_FIELD[error.field] || error.field

        if (frontendMessage) {
          // if no message is defined on frontend, we use server message
          if (!frontendMessage.message) {
            frontendMessage.message = error.message
          }
        } else {
          console.warn('NO FRONTEND ERROR CODE MAPPING', error.code) // eslint-disable-line
          // if no mapping is defined, we use server's message & type
          frontendMessage = {
            message: error.message,
            type: error.type
          }
        }

        const fieldErrors = get(consumableError, frontendField, [])
        fieldErrors.push(frontendMessage)

        set(consumableError, frontendField, fieldErrors)
      })
    }

    if (duplicate) {
      set(consumableError, '_error', DUPLICATE_APPLICATION_MESSAGE)
    }
  } else if (statusCode > 400 && statusCode < 500) {
    set(consumableError, '_error', 'An unexpected error has occurred.')
  } else if (statusCode >= 500) {
    set(consumableError, '_connection_error', 'An unexpected error has occurred.')
  }

  return consumableError
}

export function validateOnly(formState) {
  const transformedData = transform(formState)
  transformedData.activity = 'validateOnly'
  if (transformedData.certificateOrder) {
    transformedData.confirmationUrlSuccess = getConfirmationPaymentSuccessUrl()
    transformedData.confirmationUrlFailure = getConfirmationPaymentFailureUrl()
  } else {
    transformedData.confirmationUrlSuccess = getConfirmationSuccessUrl()
    transformedData.confirmationUrlFailure = ''
  }

  return fetchWithRetry('/birth-registration-api/Births/birth-registrations', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    retries: 3,
    retryDelay: 500,
    body: JSON.stringify(transformedData)
  })
  .then(checkStatus)
  .then(response => response.json())
  .catch((error) => {
    if (error.response) {
      return error.response.json()
        .then(errorJSON => {
          const reduxFormConsumableError = toReduxFormSubmissionError(errorJSON)
          throw new SubmissionError(reduxFormConsumableError)
        }, () => {
          throw new SubmissionError({ _connection_error: 'Unexpected error' })
        })
    }
  })
}

export function fullSubmit(formState) {
  const transformedData = transformFullSubmission(formState)
  transformedData.activity = 'fullSubmission'
  if (transformedData.certificateOrder) {
    transformedData.confirmationUrlSuccess = getConfirmationPaymentSuccessUrl()
    transformedData.confirmationUrlFailure = getConfirmationPaymentFailureUrl()
  } else {
    transformedData.confirmationUrlSuccess = getConfirmationSuccessUrl()
    transformedData.confirmationUrlFailure = ''
  }

  return fetchWithRetry('/birth-registration-api/Births/birth-registrations', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    retries: 3,
    retryDelay: 500,
    body: JSON.stringify(transformedData)
  })
  .then(checkStatus)
  .then(response => response.json())
  .then(result => {
    return {
      submittedData: transformedData,
      result
    };
  })
  .catch((error) => {
    if (error.response) {
      return error.response.json()
        .then(errorJSON => {
          const reduxFormConsumableError = toReduxFormSubmissionError(errorJSON)
          throw new SubmissionError(reduxFormConsumableError)
        }, () => {
          throw new SubmissionError({ _connection_error: 'Unexpected error' })
        })
    }
  })
 }

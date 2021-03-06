import React from 'react'
import PropTypes from 'prop-types'
import renderError from './render-error'
import renderWarning from './render-warning'

const renderSubFieldReview = ({ input, valueRenderer, label, meta: { error, warning } }) => {
  let valueDisplay;

  if (typeof valueRenderer === 'function') {
    valueDisplay = valueRenderer(input.value)
  } else {
    valueDisplay = input.value
  }

  return <div className="review-subfield" data-field-name={input.name}>
    <div>
      <strong>{label}</strong>
      { valueDisplay ?
        <span>{valueDisplay}</span> :
        <em>Not applicable</em>
      }
    </div>
    { renderError({ meta: { touched: true, error } }) }
    { renderWarning({ meta: { error, warning } }) }
  </div>
}

renderSubFieldReview.propTypes = {
  input: PropTypes.object,
  valueRenderer: PropTypes.func,
  label: PropTypes.node,
  meta: PropTypes.object
}

export default renderSubFieldReview

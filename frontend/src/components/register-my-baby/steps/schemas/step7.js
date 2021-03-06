import React from 'react'
import makeMandatoryLabel from 'components/form/hoc/make-mandatory-label'
import renderRadioGroup from 'components/form/fields/render-radio-group'
import renderCustomSelect from 'components/form/fields/render-custom-select'
import renderField from 'components/form/fields/render-field'
import renderPlacesAutocomplete from 'components/form/fields/render-places-autocomplete'
import { requiredWithMessage } from 'components/form/validators'
import { required, email, validCharStrict } from '../../validate'
import { maxLength } from 'components/form/normalizers'
import {
  yesNo as yesNoOptions,
  products as productOptions,
  deliveryMethods
} from '../../options'
import {
  REQUIRE_MESSAGE_STREET,
  REQUIRE_MESSAGE_POSTCODE,
} from '../../validation-messages'

const renderProductValue = (option) => {
  return <div>
    <div>{option.label}</div>
    { option.subLabel &&
      <em>{option.subLabel}</em>
    }
  </div>
}

const renderProductOption = (option) => {
  return <div>
    <div>{option.label}</div>
    { option.subLabel &&
      <em>{option.subLabel}</em>
    }
  </div>
}

const requireHandler = () => {
  throw new Error('REQUIRE_A_HANDLER_FUNCTION')
}

const PRODUCT_OPTIONS_WITH_PRICE = productOptions.map(product => ({
    ...product,
    label: `${product.label} - $${product.price.toFixed(2)}`
}))

const fields = {
  'orderBirthCertificate': {
    name: "orderBirthCertificate",
    component: renderRadioGroup,
    label: makeMandatoryLabel("Do you want to order a birth certificate?"),
    options: yesNoOptions,
    validate: [required],
  },
  'certificateOrder.productCode': {
    className: "product-select",
    name: "certificateOrder.productCode",
    component: renderCustomSelect,
    options: PRODUCT_OPTIONS_WITH_PRICE,
    optionRenderer: renderProductOption,
    valueRenderer: renderProductValue,
    label: makeMandatoryLabel("Choose your design"),
    placeholder: "Please select a design",
    validate: [required],
  },
  'certificateOrder.quantity': {
    className: "quantity-select",
    name: "certificateOrder.quantity",
    component: renderCustomSelect,
    options: [
      {value: 1, label: '1'},
      {value: 2, label: '2'},
      {value: 3, label: '3'},
      {value: 4, label: '4'},
      {value: 5, label: '5'},
    ],
    label: makeMandatoryLabel("Choose your quantity"),
    validate: [required],
  },
  'certificateOrder.courierDelivery': {
    name: "certificateOrder.courierDelivery",
    component: renderRadioGroup,
    label: makeMandatoryLabel("Choose your delivery method"),
    options: deliveryMethods,
    validate: [required],
  },
  'certificateOrder.deliveryName': {
    name: "certificateOrder.deliveryName",
    component: renderField,
    type: "text",
    label: makeMandatoryLabel("Delivery name"),
    instructionText: "You can address the certificate to your baby if you want to - just enter their name below.",
    validate: [required, validCharStrict],
    normalize: maxLength(100),
  },
  'certificateOrder.deliveryAddressType': {
    name: "certificateOrder.deliveryAddressType",
    component: renderRadioGroup,
    label: makeMandatoryLabel("What address should we deliver to?"),
    options: [],
    onChange: requireHandler,
    validate: [required],
  },
  'certificateOrder.deliveryAddress.line1': {
    name: "certificateOrder.deliveryAddress.line1",
    component: renderPlacesAutocomplete,
    type: "text",
    label: makeMandatoryLabel("Street number and Street name"),
    instructionText: "Begin typing your address, and select it from the options that appear. If required you can edit the address after you\'ve picked one.",
    onPlaceSelect: requireHandler,
    validate: [requiredWithMessage(REQUIRE_MESSAGE_STREET), validCharStrict],
    normalize: maxLength(45),
  },
  'certificateOrder.deliveryAddress.suburb': {
    name: "certificateOrder.deliveryAddress.suburb",
    component: renderField,
    type: "text",
    label: "Suburb",
    validate: [validCharStrict],
    normalize: maxLength(30),
  },
  'certificateOrder.deliveryAddress.line2': {
    name: "certificateOrder.deliveryAddress.line2",
    component: renderField,
    type: "text",
    label: makeMandatoryLabel("Town/City and Postcode"),
    validate: [requiredWithMessage(REQUIRE_MESSAGE_POSTCODE), validCharStrict],
    normalize: maxLength(30),
  },
  'certificateOrder.deliveryAddress.countryCode': {
    name: "certificateOrder.deliveryAddress.countryCode",
    component: renderCustomSelect,
    options: [],
    clearable: true,
    searchable: true,
    valueKey: "code",
    labelKey: "name",
    label: "Country (if not New Zealand)",
    placeholder: "Please select",
  },
  'certificateOrder.emailAddress': {
    name: "certificateOrder.emailAddress",
    component: renderField,
    type: "email",
    label: "Email address",
    instructionText: "If you want tax receipt, please include an email address.",
    validate: [email],
    normalize: maxLength(60),
  }
}

export default fields

import moment from 'moment'
import get from 'lodash/get'
import set from 'lodash/set'
import check from 'components/form/get-validation'
import  schema from '../schemas/step3'
import {
  MIN_10_AGE_FATHER_MESSAGE,
  REQUIRE_AT_LEAST_ONE
} from '../../validation-messages'

const validate = (values) => {
  const errors = {}

  check('assistedHumanReproduction')(schema, values, errors)

  const fatherKnown = get(values, 'fatherKnown')
  const assistedHumanReproduction = get(values, 'assistedHumanReproduction')
  const assistedHumanReproductionManConsented = get(values, 'assistedHumanReproductionManConsented')
  const assistedHumanReproductionWomanConsented = get(values, 'assistedHumanReproductionWomanConsented')
  const assistedHumanReproductionSpermDonor = get(values, 'assistedHumanReproductionSpermDonor')

  if (
    assistedHumanReproduction === 'yes' &&
    (
      !assistedHumanReproductionWomanConsented &&
      !assistedHumanReproductionManConsented &&
      !assistedHumanReproductionSpermDonor
    )
  ) {
    set(errors, 'assistedHumanReproductionError', REQUIRE_AT_LEAST_ONE)
  }

  if (assistedHumanReproduction === 'no') {
    check('fatherKnown')(schema, values, errors)
  }

  if (assistedHumanReproduction === 'yes' && assistedHumanReproductionWomanConsented) {
    check('secondParent.preferedTitle')(schema, values, errors)
  }

  if (
    fatherKnown === 'yes' ||
    (
      assistedHumanReproduction === 'yes' &&
      (assistedHumanReproductionManConsented || assistedHumanReproductionWomanConsented)
    )
  ) {
    const ethnicGroups = get(values, 'father.ethnicGroups')
    const isCitizen = get(values, 'father.isCitizen')
    const isPermanentResident = get(values, 'father.isPermanentResident')
    const isNZRealmResident = get(values, 'father.isNZRealmResident')
    const isAuResidentOrCitizen = get(values, 'father.isAuResidentOrCitizen')
    const citizenshipSource = get(values, 'father.citizenshipSource')

    check('father.firstNames')(schema, values, errors)
    check('father.surname')(schema, values, errors)
    check('father.firstNamesAtBirth')(schema, values, errors)
    check('father.surnameAtBirth')(schema, values, errors)
    check('father.occupation')(schema, values, errors)
    check('father.dateOfBirth')(schema, values, errors)
    check('father.placeOfBirth')(schema, values, errors)
    check('father.countryOfBirth')(schema, values, errors)

    check('father.homeAddress.line1')(schema, values, errors)
    check('father.homeAddress.line2')(schema, values, errors)
    check('father.homeAddress.suburb')(schema, values, errors)

    check('father.maoriDescendant')(schema, values, errors)
    check('father.ethnicGroups')(schema, values, errors)

    let childBirthDate = get(values, 'child.birthDate')
    let fatherBirthDate = get(values, 'father.dateOfBirth')

    if (childBirthDate && fatherBirthDate) {
      if (typeof fatherBirthDate === 'string') {
        fatherBirthDate = moment(fatherBirthDate)
      }

      if (typeof childBirthDate === 'string') {
        childBirthDate = moment(childBirthDate)
      }

      if (
        fatherBirthDate.isValid() &&
        childBirthDate.isValid() &&
        childBirthDate.diff(fatherBirthDate, 'years') < 10
      ) {
        set(errors, 'father.dateOfBirth', MIN_10_AGE_FATHER_MESSAGE)
      }
    }

    if (ethnicGroups && ethnicGroups.length && ethnicGroups.indexOf('other') > -1) {
      check('father.ethnicityDescription')(schema, values, errors)
    }

    check('father.isCitizen')(schema, values, errors)

    if (isCitizen === 'no') {
      check('father.isPermanentResident')(schema, values, errors)
      check('father.isNZRealmResident')(schema, values, errors)
      check('father.isAuResidentOrCitizen')(schema, values, errors)

      if (
        isPermanentResident === 'yes' ||
        isNZRealmResident === 'yes' ||
        isAuResidentOrCitizen === 'yes'
      ) {
        check('father.nonCitizenDocNumber')(schema, values, errors)
      }
    }

    if (isCitizen === 'yes') {
      check('father.citizenshipSource')(schema, values, errors)

      if (
        citizenshipSource === 'bornInNiue' ||
        citizenshipSource === 'bornInCookIslands' ||
        citizenshipSource === 'bornInTokelau'
      ) {
        check('father.citizenshipPassportNumber')(schema, values, errors)
      }
    }

    check('father.daytimePhone')(schema, values, errors)
    check('father.alternativePhone')(schema, values, errors)
    check('father.email')(schema, values, errors)
  }

  return errors
}

export default validate

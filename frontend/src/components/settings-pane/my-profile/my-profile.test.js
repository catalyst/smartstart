import React from 'react'
import { MyProfile } from 'components/settings-pane/my-profile/my-profile'
import Adapter from 'enzyme-adapter-react-16'
import { shallow, mount, configure } from 'enzyme'

let myProfile, dispatchMock, props

configure({ adapter: new Adapter() });

// mock login components, because we don't want to test login functionality here
jest.mock('components/primary-login/primary-login')

beforeEach(() => {
  dispatchMock = jest.fn()
  props = {
    personalisationValues: {},
    dispatch: dispatchMock,
    shown: true,
    isLoggedIn: false,
    profilePaneClose: function() {}
  }

  dispatchMock.mockReturnValue({
    then: () => {}
  })
})

describe('initial render', () => {
  beforeEach(() => {
    myProfile = shallow(
      <MyProfile {...props} />
    )
  })

  test('it has a date input', () => {
    expect(myProfile.find('input[type="date"]').length).toEqual(1)
  })

  test('it has cancel/update buttons', () => {
    expect(myProfile.find('button.cancel-button').length).toEqual(1)
    expect(myProfile.find('button[type="submit"]').length).toEqual(1)
  })
})

describe('render stored due date from state', () => {
  test('it displays the valid due date from props', () => {
    props = {
      ...props,
      personalisationValues: {
        settings: {
          dd: '2016-10-07'
        }
      }
    }

    myProfile = shallow(
      <MyProfile {...props} />
    )
    expect(myProfile.find('input[type="date"]').props().value).toEqual('2016-10-07')
  })

  test('it does not display the invalid date', () => {
    props = {
      ...props,
      personalisationValues: {
        settings: {
          dd: 'invalid date'
        }
      }
    }

    myProfile = shallow(
      <MyProfile {...props} />
    )

    expect(myProfile.find('input[type="date"]').props().value).toEqual('')
  })
})

describe('date validation and submit', () => {
  let profilePaneCloseMock

  beforeEach(() => {
    profilePaneCloseMock = jest.fn()

    props = {
      ...props,
      profilePaneClose: profilePaneCloseMock
    }

    myProfile = mount(
      <MyProfile {...props} />
    )
  })

  describe('anonymous user', () => {

    beforeEach(() => {
    })

    test('it should prevent submission if an invalid date is entered', () => {
      myProfile.find('input[type="date"]').simulate('change', {target: {value: 'invalid date'}})

      // enzyme does not support event propagation, so simulating a click on the submit button does not work
      // simulate the submit on the form directly
      myProfile.find('form').simulate('submit')

      expect(profilePaneCloseMock).not.toHaveBeenCalled()
      expect(dispatchMock.mock.calls.length).toEqual(0)
    })

    test('it should allow submission even if no date is entered', () => {
      myProfile.find('form').simulate('submit')

      expect(profilePaneCloseMock).toHaveBeenCalled()
      // one dispatch for updating the date to '' in timeline, one to save '' to store
      expect(dispatchMock.mock.calls.length).toEqual(2)
    })

    test('it should submit if the date is valid', () => {
      myProfile.find('input[type="date"]').simulate('change', {target: {value: '2016-10-01'}})
      myProfile.find('form').simulate('submit')

      expect(profilePaneCloseMock).toHaveBeenCalled()
      // one to update the timeline date, one to record the addition of the
      // date to piwik, one to save the values to the store
      expect(dispatchMock.mock.calls.length).toEqual(5)
    })

    test('it should show login button and text when user is not logged in', () => {
      expect(myProfile.find('PrimaryLogin')).toBeTruthy()
      expect(myProfile.find('.login-section h4').text()).toEqual('Please login to sign up or update your details')
    })
  })

  describe('authenticated user', () => {
    test.skip('it should display user data correctly', () => {})
    test.skip('it should not submit if form invalid', () => {})
    test.skip('it should submit if form valid', () => {})

    test('it should show confirmation text when user is logged in', () => {
      myProfile.setState({ isJustLoggedIn: true})
      expect(myProfile.find('.login-section h6').text()).toEqual('You are now logged in.')
    })
  })
})

describe('other actions', () => {
  test('it closes the pane without submitting when the cancel button is used', () => {
    let profilePaneCloseMock = jest.fn()

    props = {
      ...props,
      profilePaneClose: profilePaneCloseMock
    }

    myProfile = mount(
      <MyProfile {...props} />
    )

    myProfile.find('.cancel-button').simulate('click')

    expect(profilePaneCloseMock).toHaveBeenCalled()
    expect(dispatchMock.mock.calls.length).toEqual(0)
  })
})

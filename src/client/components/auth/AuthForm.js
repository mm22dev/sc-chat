import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'semantic-ui-react'

const AuthForm = ({ authType, storedName, onInputChange, handleUserData, mutationResponse }) =>
  <Form>
    {
      authType === 'SIGNUP' || authType === 'UPDATE'
        ? <Form.Input
          icon='user'
          iconPosition='left'
          name={authType==='UPDATE' ? 'newName' : 'name'}
          placeholder='Username'
          defaultValue={storedName ? storedName : null} 
          onChange={onInputChange}
        />
        : null
    }
    {
      authType === 'UPDATE'
        ? <Form.Input
            icon='lock'
            iconPosition='left'
            name='newPassword'
            type='password'
            placeholder='New Password'
            onChange={onInputChange}
          />
        : <Form.Input
            icon='mail'
            iconPosition='left'
            name='email'
            type='email'
            placeholder='E-mail'
            onChange={onInputChange}
          />
    }
    <Form.Input
      icon='lock'
      iconPosition='left'
      name={authType==='UPDATE' ? 'currentPassword' : 'password'}
      type='password'
      placeholder={authType==='UPDATE' ? 'Current password' : 'Password'}
      onChange={onInputChange}
    />
    <Button
      basic
      inverted
      content={authType==='SIGNUP' ? 'Register' : authType==='UPDATE' ? 'Update' : 'Login'}
      onClick={handleUserData}
      disabled={mutationResponse.loading}
      loading={mutationResponse.loading}
    />
  </Form>

AuthForm.propTypes = {
  authType: PropTypes.string.isRequired,
  storedName: PropTypes.string,
  onInputChange: PropTypes.func.isRequired,
  handleUserData: PropTypes.func,
  mutationResponse: PropTypes.object,
}

export default AuthForm

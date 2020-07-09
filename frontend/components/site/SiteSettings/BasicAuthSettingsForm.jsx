import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import InputWithErrorField from '../../Fields/InputWithErrorField';
import { validBasicAuthUsername, validBasicAuthPassword } from '../../../util/validators';
import { BASIC_AUTH } from '../../../propTypes';

export const validateBasicAuthPassword = (value) => {
  if (value && value.length && !validBasicAuthPassword(value)) {
    return 'Password may contain alphanumeric characters and symbols !@$. Minimum length 6 characters.';
  }

  return undefined;
};

export const validateBasicAuthUsername = (value) => {
  if (value && value.length && !validBasicAuthUsername(value)) {
    return 'Username is invalid. Only alphanumeric characters are allowed. Minimum length 4 characters.';
  }

  return undefined;
};

export const BasicAuthSettingsForm = ({
  handleSubmit, invalid, pristine, submitting, initialValues,
}) => (
  <form className="settings-form" onSubmit={data => handleSubmit(data)}>
    <h3>Basic Authentication Settings</h3>
    <div className="well">
      <fieldset>
        <p className="well-text">
          To enable basic authentication, please submit a username and password credentials required to preview your site builds.
        </p>
        <Field
          name="username"
          type="text"
          label="Username:"
          component={InputWithErrorField}
          required
          validate={[validateBasicAuthUsername]}
          placeholder="username"
          id="basicAuthUsernameInput"
        />
        <Field
          name="password"
          type="password"
          label="Password:"
          component={InputWithErrorField}
          required
          validate={[validateBasicAuthPassword]}
          placeholder="**********"
          id="basicAuthPasswordInput"
        />
      </fieldset>
      <button type="submit" disabled={invalid || pristine || submitting}>
        Save
      </button>
    </div>
  </form>
);

BasicAuthSettingsForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  invalid: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  initialValues: BASIC_AUTH.isRequired,
};

export default reduxForm({
  form: 'basicAuth',
  enableReinitialize: true,
})(BasicAuthSettingsForm);

'use strict';

import React from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router'
import { ProfileForm } from './components/profileform';

export class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.submitProfileInfo = this.submitProfileInfo.bind(this);
    }

    submitProfileInfo(info) {
      $.ajax({
        type: "POST",
        url: '/v1/user', 
        data: {
          city: info.city,
          first_name: info.first_name,
          last_name: info.last_name,
          password: info.password,
          primary_email: info.primary_email,
          username: info.username,
          tombstoned: 'false',
        },
        success: res => {
          sessionStorage.setItem("current_user", res.username);
          sessionStorage.setItem("user_email", res.primary_email);
          sessionStorage.setItem("email_hash", res.email_hash);
          browserHistory.push('/profile?username='+res.username)
        },
        error: err => { console.log('error ' + err) },
      });
    }

    render() {
        return <div>
            <div
              className="form-container"
            >
              <div className="login-form container">
                <h2 className="form-signin-heading">Register</h2>
                <ProfileForm onSubmit={this.submitProfileInfo}></ProfileForm>
              </div>
            </div>
        </div>;
    }
}

'use strict';

import React from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router'

import { GameSummary } from './components/gamesummary';
import { NavBar } from './components/navbar';
import { ProfileForm } from './components/profileform';

export class Edit extends React.Component {
    constructor(props) {
        super(props);
    }

    submitProfileInfo(info) {
      $.ajax({
        type: "POST",
        url: '/v1/edit', 
        data: {
          city: info.city,
          first_name: info.first_name,
          last_name: info.last_name,
          password: info.password,
          primary_email: info.primary_email,
          username: info.username,
          tombstoned: info.tombstoned,
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
          <div className="edit-page">
            <div
              className="form-container"
            >
              <div className="login-form container">
                <h2 className="form-signin-heading">Edit</h2>
                <ProfileForm
                  onSubmit={this.submitProfileInfo}
                  allowSetInactive={true}
                  allowEmptyFields={true}
                ></ProfileForm>
              </div>
            </div>
          </div>
        </div>;
    }
}

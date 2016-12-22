'use strict';

import React from 'react';
import { Link } from 'react-router';

export class ProfileForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            first_name: '',
            last_name: '',
            password: '',
            city: '',
            primary_email: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this._isValidSignup = this._isValidSignup.bind(this);
        this._isValidEmail = this._isValidEmail.bind(this);
        this._isValidPassword = this._isValidPassword.bind(this);
        this._isValidUsername = this._isValidUsername.bind(this);
        this._getSetInactiveInput = this._getSetInactiveInput.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleSubmit(event) {
        console.log('submitted');
        window.e = event;
        event.preventDefault();
        if (this._isValidSignup()) {
          this.props.onSubmit(this.state);
          return;
        }
        console.log('bad info');
    }
    
    _isValidSignup() {
        return (
          this._isValidUsername(this.state.username) &&
          this._isValidPassword(this.state.password) &&
          this._isValidEmail(this.state.primary_email)
        );
    }
    
    _isValidEmail(email) {
        if (_.isEmpty(email)) return this.props.allowEmptyFields;
        let regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        return email && regex.test(email);
    }
    
    _isValidPassword(pwd) {
        if (_.isEmpty(pwd)) return this.props.allowEmptyFields;
        return (pwd && pwd.length > 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd));
    }
    
    _isValidUsername(username) {
        if (_.isEmpty(username)) return this.props.allowEmptyFields;
        return (username && username.length >= 6 && username.length <= 16 &&
          /^[a-z0-9]+$/i.test(username));
    }

    _getSetInactiveInput() {
      if (!this.props.allowSetInactive) return;
      return (
        <div className="form-group row">
          <label htmlFor="tombstoned" className="col-xs-2 col-form-label">Set Inactive</label>
          <div className="col-xs-10">
            <input
              className="form-control"
              type="checkbox"
              className="form-check-input"
              name="tombstoned"
              id="tombstoned"
            >
            </input>
          </div>
        </div>
      );
    }
    render() {
        return <div>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group row">
              <label htmlFor="username" className="col-sm-3 col-form-label">Username</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  name="username"
                  onChange={this.handleChange}
                  placeholder="johndoe14"
                  type="text"
                  value={this.state.username}
                ></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="first_name" className="col-sm-3 col-form-label">First Name</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  id="first_name"
                  name="first_name"
                  placeholder="John"
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.first_name}
                ></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="last_name" className="col-sm-3 col-form-label">Last Name</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  id="last_name"
                  name="last_name"
                  placeholder="Doe"
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.last_name}
                ></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="password" className="col-sm-3 col-form-label">Password</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  id="password"
                  name="password"
                  type="password"
                  onChange={this.handleChange}
                  value={this.state.password}
                ></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="city" className="col-sm-3 col-form-label">City</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  id="city"
                  name="city"
                  placeholder="New York"
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.city}
                ></input>
              </div>
            </div>
            <div className="form-group row">
              <label htmlFor="primary_email" className="col-sm-3 col-form-label">Email</label>
              <div className="col-sm-9">
                <input
                  className="form-control"
                  id="primary_email"
                  name="primary_email"
                  placeholder="johndoe@mail.com"
                  type="email"
                  onChange={this.handleChange}
                  value={this.state.primary_email}
                ></input>
              </div>
            </div>
            {this._getSetInactiveInput()}
            <div id="signup-alert"></div>
            <div className="form-group row">
              <div className="offset-sm-2 col-sm-9">
                <button
                  className="btn btn-primary"
                  id="signup-submit"
                  type="submit"
                >Submit</button>
              </div>
            </div>
          </form>
        </div>;
    }
}

ProfileForm.proptypes = {
  onSubmit: React.PropTypes.func.isRequired,
}


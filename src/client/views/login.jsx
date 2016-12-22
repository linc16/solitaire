'use strict';

import React from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    }
    
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loginUser = this.loginUser.bind(this);
  }

  handleClick() {
    console.log(this.props);
  }
  
  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    this.loginUser();
  }
  
  loginUser() {
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/v1/session",
      data: {
        password: this.state.password,
        username: this.state.username,
      },
      success: res => {
        $("#login-alert").html();
        sessionStorage.setItem("current_user", res.username);
        sessionStorage.setItem("user_email", res.primary_email);
        sessionStorage.setItem("email_hash", res.email_hash);
        browserHistory.push('/start');
      },
      error: err => {
        $("#login-alert").html(
          "<div class=\"alert alert-danger\">Invalid username or password</div>"
        );
      },
    });
  }

  render() {
      return <div>
           <div className="form-container" >
             <div className="login-form container">
               <h2 className="form-signin-heading">Login</h2>
               <form id="login-form" onSubmit={this.handleSubmit}>
                 <div className="form-group row">
                   <label className="col-sm-2 col-form-label">Username</label>
                   <div className="col-sm-10">
                     <input
                       className="form-control"
                       id="username"
                       name="username"
                       onChange={this.handleChange}
                       type="text"
                       value={this.state.username}
                     >
                     </input>
                   </div>
                 </div>
                 <div className="form-group row">
                   <label className="col-sm-2 col-form-label">password</label>
                   <div className="col-sm-10">
                     <input
                       className="form-control"
                       id="password"
                       name="password"
                       onChange={this.handleChange}
                       type="password"
                       value={this.state.password}
                     >
                     </input>
                   </div>
                 </div>
                 <div id="login-alert"></div>
                 <div className="form-group row">
                   <div className="offset-sm-2 col-sm-9">
                     <button
                       className='btn btn-primary'
                       to='/start'
                       id='login-submit'
                       type='submit'
                     >Login</button>
                   </div>
                 </div>
               </form>
             </div>
           </div>
      </div>;
  }
}

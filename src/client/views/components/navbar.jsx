'use strict';

import React from 'react';
import { Link } from 'react-router';

export class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this._isUserLoggedIn = this._isUserLoggedIn.bind(this);
        this._renderLoginBtn = this._renderLoginBtn.bind(this);
        this._renderLogoutBtn = this._renderLogoutBtn.bind(this);
        this._renderStartGameBtn = this._renderStartGameBtn.bind(this);
        this._renderEditBtn = this._renderEditBtn.bind(this);
        this._renderGravitar = this._renderGravitar.bind(this);
        this._renderRegisterBtn = this._renderRegisterBtn.bind(this);
        this._getEmailHash = this._getEmailHash.bind(this);
        this._logout = this._logout.bind(this);
    }

    _isUserLoggedIn() {
      return this.props.activeUser && this.props.activeUser.length > 0;
    }

    _renderLoginBtn() {
      if (this._isUserLoggedIn()) return;
      return <Link className='btn btn-info' to='/login'>Login</Link>
    }

    _renderLogoutBtn() {
      if (!this._isUserLoggedIn()) return;
      return <Link className='btn btn-info' onClick={this._logout} to='/login'>Logout</Link>
    }

    _renderStartGameBtn() {
      if (!this._isUserLoggedIn()) return; 
      return <Link className='btn btn-info' to='/start'>Start Game</Link>
    }

    _renderEditBtn() {
      if (!this._isUserLoggedIn() || this.props.username != this.props.activeUser) return; 
      return <Link className='btn btn-info' to='/edit'>Edit</Link>
    }

    _getEmailHash() {
      return sessionStorage.getItem('email_hash');
    }
    _renderGravitar() {
      if(!this._isUserLoggedIn()) return;
      return <img src={'https://s.gravatar.com/avatar/' + this._getEmailHash() + '?s=35'}></img>
    }

    _renderRegisterBtn() {
      if (this._isUserLoggedIn()) return; 
      return <Link className='btn btn-info' to='/signup'>Register</Link>
    }

    _logout() {
      sessionStorage.removeItem('current_user');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('email_hash');
      console.log('logged out');
      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/v1/logout",
        data: {
          username: this.props.activeUser,
        },
        success: res => { console.log('successful logout') },
        error: err => { console.log(err) },
      });
    }

    render() {
        return <div>
          <nav className="mynav">
            <ul>
              {this._renderLogoutBtn()}
              {this._renderStartGameBtn()}
              {this._renderEditBtn()}
              {this._renderGravitar()}
              {this._renderRegisterBtn()}
              {this._renderLoginBtn()}
            </ul>
          </nav>
        </div>
    }
}

NavBar.proptypes = {
  username: React.PropTypes.string,
  active_user: React.PropTypes.string,
}

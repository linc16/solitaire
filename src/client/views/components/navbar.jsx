'use strict';

import React from 'react';
import { Link } from 'react-router';

const ActiveUser = require('../../utils/active_user');

export class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this._isUserLoggedIn = this._isUserLoggedIn.bind(this);
        this._renderHomeBtn = this._renderHomeBtn.bind(this);
        this._renderLoginBtn = this._renderLoginBtn.bind(this);
        this._renderLogoutBtn = this._renderLogoutBtn.bind(this);
        this._renderStartGameBtn = this._renderStartGameBtn.bind(this);
        this._renderProfileBtn = this._renderProfileBtn.bind(this);
        this._renderEditBtn = this._renderEditBtn.bind(this);
        this._renderGravitar = this._renderGravitar.bind(this);
        this._renderRegisterBtn = this._renderRegisterBtn.bind(this);
        this._getEmailHash = this._getEmailHash.bind(this);
        this._logout = this._logout.bind(this);
    }

    _isUserLoggedIn() {
      return this.props.activeUser && this.props.activeUser.length > 0;
    }

    _renderHomeBtn() {
      return <Link className='btn btn-info navbtn' to='/'>Home</Link>
    }

    _renderLoginBtn() {
      if (this._isUserLoggedIn()) return;
      return <Link className='btn btn-info navbtn' to='/login'>Login</Link>
    }

    _renderLogoutBtn() {
      if (!this._isUserLoggedIn()) return;
      return <Link className='btn btn-info navbtn' onClick={this._logout} to='/login'>Logout</Link>
    }

    _renderStartGameBtn() {
      if (this.props.isStartGamePage || !this._isUserLoggedIn()) return; 
      return <Link className='btn btn-info navbtn' to='/start'>Start Game</Link>
    }

    _renderProfileBtn() {
      if (this.props.isProfile) return; 
      let link = '/profile?username=' + this.props.activeUser;
      return <Link className='btn btn-info navbtn' to={link}>Profile</Link>
    }

    _renderEditBtn() {
      if (!this.props.isProfile || !this._isUserLoggedIn() || this.props.username != this.props.activeUser) return; 
      return <Link className='btn btn-info navbtn' to='/edit'>Edit</Link>
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
      return <Link className='btn btn-info navbtn' to='/signup'>Register</Link>
    }

    _logout() {
      ActiveUser.removeActiveUser();
      ActiveUser.removeUserEmail();
      ActiveUser.removeEmailHash();
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
            {this._renderHomeBtn()}
            <ul>
              {this._renderLogoutBtn()}
              {this._renderStartGameBtn()}
              {this._renderProfileBtn()}
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
  activeUser: React.PropTypes.string,
  isProfile: React.PropTypes.bool,
  isStartGamePage: React.PropTypes.bool,
}

'use strict';

import React from 'react';
import { Link } from 'react-router';

export class ProfileInfo extends React.Component {
  constructor(props) {
      super(props);
  }

  render() {
    return <div>
      <div className='row'>
        <div className='col-sm-4 profile-picture'>
          <img
            className='profile-picture-img'
            src={`https://s.gravatar.com/avatar/${this.props.email_hash}`}
          ></img>
        </div>
        <div className='col-sm-6'>
          <div className='row profile-info'>
            <div className='col-xs-6'>
              <span>Games Played:</span>
            </div>
            <div className='col-xs-6'>
              <span>{this.props.games_played}</span>
            </div>
          </div>
          <div className='row profile-info'>
            <div className='col-xs-6'>
              <span>Win Ratio:</span>
            </div>
            <div className='col-xs-6'>
              <span>{this.props.win_ratio}</span>
            </div>
          </div>
          <div className='row profile-info'>
            <div className='col-xs-6'>
              <span>Fastest Win:</span>
            </div>
            <div className='col-xs-6'>
              <span>{this.props.fastest_win}</span>
            </div>
          </div>
          <div className='row profile-info'>
            <div className='col-xs-6'>
              <span>Highest Score:</span>
            </div>
            <div className='col-xs-6'>
              <span>{this.props.max_score}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='row profile-name-row'>
        <h3 className='form-signin-heading'>
          <span className='profile-first-name' id='first_name'>{this.props.first_name}</span>
          <span id='last_name'>{this.props.last_name}</span>
        </h3>
        <h4>{this.props.username}</h4>
      </div>
      <div className='row profile-contact-row'>
        <div className='row'>
          <div className='col-xs-2 img-centered'>
            <img className='profile-city-img' src='img/city-img.png'></img>
          </div>
          <div className='col-xs-10'>
            <div>{this.props.city}</div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-2 img-centered'>
            <img className='profile-email-img' src='img/email-img.png'></img>
          </div>
          <div className='col-xs-10'>
            <div>{this.props.primary_email}</div>
          </div>
        </div>
      </div>
    </div>;
  }
}

ProfileInfo.proptypes = {
  city: React.PropTypes.String,
  email_hash: React.PropTypes.String,
  fastest_win: React.PropTypes.String,
  first_name: React.PropTypes.String,
  games_played: React.PropTypes.String,
  last_name: React.PropTypes.String,
  max_score: React.PropTypes.String,
  primary_email: React.PropTypes.String,
  username: React.PropTypes.String,
  win_ratio: React.PropTypes.String,
}

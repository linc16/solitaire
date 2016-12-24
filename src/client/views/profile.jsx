'use strict';

import React from 'react';
import { Link } from 'react-router';
import { GameSummary } from './components/gamesummary';
import { ProfileInfo } from './components/profileinfo';
import { NavBar } from './components/navbar';
const ActiveUser = require('../utils/active_user');

export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this._getProfileInfo = this._getProfileInfo.bind(this);
        this._handleGameDelete = this._handleGameDelete.bind(this);
        this._getProfileOwner = this._getProfileOwner.bind(this);
        this.state = {
          active_user: ActiveUser.getActiveUser(),
          city: '',
          email_hash: '',
          fastest_win: "NA",
          first_name: '',
          games: [],
          games_played: '',
          last_name: '',
          max_score: 0,
          primary_email: '',
          username: this._getProfileOwner(),
          win_ratio: '',
        };
    }

    componentDidMount() {
        this._getProfileInfo();
    }

    _getProfileOwner() {
      let regex = /username=(.+)/;
      let match = window.location.href.match(regex);
      return match && match[1];
    }

    _getEmailHash() {
      return sessionStorage.getItem('email_hash');
    }

   _getProfileInfo() {
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "/v1/profile/info",
            data: {
              username: this.state.username,
            },
            success: res => { this._handleProfileInfoRes(res) },
            error: err => { console.log(err) },
        });
    }

    _handleProfileInfoRes(res) {
      this.setState({
        city: res.city,
        email_hash: res.email_hash,
        fastest_win: res.fastest_win,
        first_name: res.first_name,
        games: res.games || [],
        games_played: res.games_played,
        last_name: res.last_name,
        max_score: res.max_score,
        primary_email: res.primary_email,
        username: res.username,
        win_ratio: res.win_ratio,
      });
    }

    _handleGameDelete(gameId) {
      this.setState({
        games: _.filter(this.state.games, game => { return !_.isEqual(game._id, gameId) })
      });
    }

    _renderGameSummary() {
      if (!_.isEqual(this.state.username, this.state.active_user)) return;
      return (
        <GameSummary
          games={this.state.games}
          username={this.state.username}
          onGameDelete={this._handleGameDelete}
        >
        </GameSummary>
      )
    }
    render() {
        return <div>
            <NavBar
              username={this.state.username}
              activeUser={this.state.active_user}
              isProfile={true}
            ></NavBar>
            <div className="isProfile">
              <div className="form-container">
                <div className="row profile-content">
                  <div className="col-md-6">
                    <ProfileInfo
                      city={this.state.city}
                      email_hash={this.state.email_hash}
                      fastest_win={this.state.fastest_win}
                      first_name={this.state.first_name}
                      games_played={this.state.games_played}
                      last_name={this.state.last_name}
                      max_score={this.state.max_score}
                      primary_email={this.state.primary_email}
                      username={this.state.username}
                      win_ratio={this.state.win_ratio}
                    ></ProfileInfo>
                  </div>
                  <div className="col-md-6">  
                    {this._renderGameSummary()}
                  </div>
                </div>
              </div>
            </div>
        </div>;
    }
}

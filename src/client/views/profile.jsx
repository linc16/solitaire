'use strict';

import React from 'react';
import { Link } from 'react-router';
import { GameSummary } from './components/gamesummary';
import { NavBar } from './components/navbar';

export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this._getProfileInfo = this._getProfileInfo.bind(this);
        this._handleGameDelete = this._handleGameDelete.bind(this);
        this._getActiveUser = this._getActiveUser.bind(this);
        this._getProfileOwner = this._getProfileOwner.bind(this);
        this.state = {
          active_user: this._getActiveUser(),
          city: '',
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

    _getActiveUser() {
      return sessionStorage.getItem('current_user');
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
            <NavBar username={this.state.username} activeUser={this.state.active_user}></NavBar>
            <div className="isProfile">
              <div className="form-container">
                <div className="profile-form">
                <div className="row myrow">
                  <h2 className="form-signin-heading">
                    <span className="profile-first-name" id="first_name">{this.state.first_name}</span>
                    <span id="last_name">{this.state.last_name}</span>
                  </h2>
                  <h4><span id="username">{this.state.username}</span></h4>
                </div>
                <div className="row myrow">
                  <div className="col-sm-4 profile-picture">
                    <img
                      className="profile-picture-img"
                      src="https://s.gravatar.com/avatar/4e0e55d0dc86c5e9d5390f80a23a6f8f"
                    ></img>
                  </div>
                  <div className="col-sm-6">
                    <div className="row profile-info">
                      <div className="col-xs-6">
                        <span>Games Played:</span>
                      </div>
                      <div className="col-xs-6">
                        <span>{this.state.games_played}</span>
                      </div>
                    </div>
                    <div className="row profile-info">
                      <div className="col-xs-6">
                        <span>Win Ratio:</span>
                      </div>
                      <div className="col-xs-6">
                        <span>{this.state.win_ratio}</span>
                      </div>
                    </div>
                    <div className="row profile-info">
                      <div className="col-xs-6">
                        <span>Fastest Win:</span>
                      </div>
                      <div className="col-xs-6">
                        <span>{this.state.fastest_win}</span>
                      </div>
                    </div>
                    <div className="row profile-info">
                      <div className="col-xs-6">
                        <span>Highest Score:</span>
                      </div>
                      <div className="col-xs-6">
                        <span>{this.state.max_score}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row myrow">
                  <h5>{this.state.city}</h5>
                </div>
                <div className="row myrow">
                  <h5><span id="primary_email">{this.state.primary_email}</span></h5>
                </div>
                <div id="game-preview">
                  {this._renderGameSummary()}
                </div>
                </div>
              </div>
            </div>
        </div>;
    }
}

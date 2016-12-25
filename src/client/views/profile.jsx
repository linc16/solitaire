'use strict';

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { GameSummary } from './components/gamesummary';
import { ProfileUserInfo } from './components/profileuserinfo';
import { ProfileStats } from './components/profilestats';
import { NavBar } from './components/navbar';
const ActiveUser = require('../utils/active_user');

export class Profile extends React.Component {
    constructor(props) {
        super(props);
        this._getProfileInfo = this._getProfileInfo.bind(this);
        this._handleGameDelete = this._handleGameDelete.bind(this);
        this._getProfileOwner = this._getProfileOwner.bind(this);
        this._isActiveUserProfile = this._isActiveUserProfile.bind(this);
        this.state = {
          active_user: ActiveUser.getActiveUser(),
          city: '',
          email_hash: '',
          fastest_win: 'NA',
          first_name: '',
          games: [],
          games_played: 'NA',
          last_name: '',
          max_score: 0,
          primary_email: '',
          username: this._getProfileOwner(),
          win_ratio: 'NA',
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
            type: 'GET',
            dataType: 'json',
            url: '/v1/profile/info',
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
        fastest_win: res.fastest_win || 'NA',
        first_name: res.first_name,
        games: res.games || [],
        games_played: res.games_played || 'NA',
        last_name: res.last_name,
        max_score: res.max_score || 'NA',
        primary_email: res.primary_email,
        username: res.username,
        win_ratio: res.win_ratio || 'NA',
      });
    }

    _handleGameDelete(gameId) {
      this.setState({
        games: _.filter(this.state.games, game => { return !_.isEqual(game._id, gameId) })
      });
    }

    _isActiveUserProfile() {
      return _.isEqual(this.state.username, this.state.active_user);
    }

    render() {
        return <div>
          <NavBar
            username={this.state.username}
            activeUser={this.state.active_user}
            isProfile={true}
          ></NavBar>
          <div className='form-container'>
            <div className='profile-content'>
              <div className='row'>
                <div className='col-sm-4'>
                  <ProfileUserInfo
                    city={this.state.city}
                    email_hash={this.state.email_hash}
                    first_name={this.state.first_name}
                    last_name={this.state.last_name}
                    primary_email={this.state.primary_email}
                    username={this.state.username}
                  ></ProfileUserInfo>
                </div>
                <div className='col-sm-8'>  
                  <Tabs>
                    <TabList>
                      <Tab>Games</Tab>
                      <Tab>Stats</Tab>
                    </TabList>
                    <TabPanel>
                      <GameSummary
                        games={this.state.games}
                        username={this.state.username}
                        onGameDelete={this._handleGameDelete}
                        isActiveUserProfile={this._isActiveUserProfile()}
                      >
                      </GameSummary>
                    </TabPanel>
                    <TabPanel>
                      <ProfileStats
                        fastest_win={this.state.fastest_win}
                        games_played={this.state.games_played}
                        max_score={this.state.max_score}
                        win_ratio={this.state.win_ratio}
                      ></ProfileStats>
                    </TabPanel>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>;
    }
}

'use strict';

import React from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router'

import { NavBar } from './components/navbar';
const ActiveUser = require('../utils/active_user');

export class StartGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_user: ActiveUser.getActiveUser(),
      deck_type: 'normal',
      draw_count: '1',
      game_name: 'placeholdername',
      game_type: 'klondike',
      num_players: 1,
    }
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._isValidGameInfo = this._isValidGameInfo.bind(this);
    this._setErrorMsg = this._setErrorMsg.bind(this);
    this._submitGameInfo = this._submitGameInfo.bind(this);
    this._getShuffledDeck = this._getShuffledDeck.bind(this);
    this._setInitialGameState = this._setInitialGameState.bind(this);
    this._postGameState = this._postGameState.bind(this);
    this._getGameState = this._getGameState.bind(this);
  }

  componentWillMount() {
    if (!this.state.active_user || this.state.active_user.length == 0) {
      browserHistory.push('/login')
      return;
    }
    $('.start-page').css({ 'opacity': 1 });
  }

  handleClick() {
    console.log(this.props);
  }
  
  handleChange(event) {
    window.e = event;
    this.setState({[event.target.name]: event.target.value});
  }


  handleSubmit(event) {
    event.preventDefault();
    console.log('submitted');
    if (!this._isValidGameInfo()) {
      this._setErrorMsg('Invalid Game Info');
      return;
    }
    this._submitGameInfo();
  }

  _isValidGameInfo() {
    let valid_game_type = ["klondike", "pyramid", "canfield", "golf", "yukon"].
      includes(this.state.game_type);
    let valid_draw_count = ["1","2","3"].includes(this.state.draw_count);
    return valid_game_type && valid_draw_count;
  }

  _setErrorMsg(msg) {
    $("#start-game-alert").html(
      "<div class=\"alert alert-danger\">" + msg + "</div>"
    );
  }
  
  _submitGameInfo() { 
    $.ajax({
      type: "POST",
      url: "/v1/game",
      data: {
        deck_type: this.state.deck_type,
        draw_num: this.state.draw_count,
        name: this.state.game_name,
        num_players: this.state.num_players,
        type: this.state.game_type,
      },
      success: resp => { this._getShuffledDeck(resp.planid, () => {
        browserHistory.push('/game?id=' + resp.planid);
      })},
      error: err => {
        $("#start-game-alert").html(
          "<div class=\"alert alert-danger\">Invalid game selection</div>"
        );
      }
    });
  }
  
  _getShuffledDeck(gameId, next) {
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "/v1/game/shuffle?jokers=false",
      success: (res) => {
        this._setInitialGameState(res, gameId, next);
      },
      error: err => {},
    });
  }
  
  _setInitialGameState(deck, gameId, next) {
    let deck_index = 0;
    for (let i = 1; i <= Constants.NUM_PILES; ++i) {
      let pile = []
      for (let j = 0; j < i; ++j) {
        let up = (j === i - 1);
        let card = deck[deck_index];
        ++deck_index;
        card['up'] = up;
        pile.push(card);
      }
      localStorage.setItem('pile' + i, JSON.stringify(pile));
    }
    for (let i = 0; i < Constants.NUM_STACKS; ++i) {
      localStorage.setItem('stack' + (i + 1), JSON.stringify([]));
    }
    let draw = []
    for (deck_index; deck_index < deck.length; ++deck_index) {
      let card = deck[deck_index];
      card['up'] = false;
      draw.push(card);
      
    }
    localStorage.setItem('draw', JSON.stringify(draw));
    localStorage.setItem('discard', JSON.stringify([]));
    localStorage.setItem('selectEvent', JSON.stringify({}));
    localStorage.setItem('gameId', gameId);
    this._postGameState(gameId);
    next();
  }
  
  _postGameState(id) {
    let state = this._getGameState();
    $.ajax({
      type: "PUT",
      dataType: "json",
      url: "/v1/game/" + id,
      data: {
        state,
      },
      success: res => {
        console.log('success state update');
        console.log(res);
      },
      error: err => {
        console.log('failed state update');
        console.log('err: ' + JSON.stringify(err));
      },
    });
  }
  
  _getGameState() {
    let state = {
      'draw': JSON.parse(localStorage.getItem('draw')),
      'discard': JSON.parse(localStorage.getItem('discard')),
      'pile1': JSON.parse(localStorage.getItem('pile1')),
      'pile2': JSON.parse(localStorage.getItem('pile2')),
      'pile3': JSON.parse(localStorage.getItem('pile3')),
      'pile4': JSON.parse(localStorage.getItem('pile4')),
      'pile5': JSON.parse(localStorage.getItem('pile5')),
      'pile6': JSON.parse(localStorage.getItem('pile6')),
      'pile7': JSON.parse(localStorage.getItem('pile7')),
      'stack1': JSON.parse(localStorage.getItem('stack1')),
      'stack2': JSON.parse(localStorage.getItem('stack2')),
      'stack3': JSON.parse(localStorage.getItem('stack3')),
      'stack4': JSON.parse(localStorage.getItem('stack4')),
    }
    return state;
  }

  render() {
    return <div>
      <NavBar
        activeUser={this.state.active_user}
        isStartGamePage={true}
      ></NavBar>
      <div className="start-page">
        <div className="form-container">
        <div className="login-form container">
          <h2 className="form-signin-heading">Create a Game!</h2>
          <form id="start-game-form" onSubmit={this.handleSubmit}>
          <div className="form-group row">
            <label htmlFor="game_type" className="col-sm-4 col-form-label">Game Type</label>
            <div className="col-sm-8">
            <select
              className="form-control"
              id="game_type"
              name="game_type"
              onChange={this.handleChange}
              value={this.state.game_type}
            >
              <option value="klondike">Klondike</option>
              <option value="pyramid">Pyramid</option>
              <option value="canfield">Canfield</option>
              <option value="golf">Golf</option>
              <option value="yukon">Yukon</option>
            </select>
            </div>
          </div>
          <div className="form-group row">
            <label htmlFor="draw_count" className="col-sm-4 col-form-label">Number of Cards Drawn</label>
            <div className="col-sm-8">
            <select
              className="form-control"
              id="draw_count"
              name="draw_count"
              onChange={this.handleChange}
              value={this.state.draw_count}
            >
              <option defaultValue="1">1</option>
              <option value="3">3</option>
            </select>
            </div>
          </div>
          <div id="start-game-alert"></div>
          <div className="form-group row">
            <div className="offset-sm-2 col-sm-9">
            <button
              className="btn btn-primary"
              to='/game'
              id="start-game-submit"
            >Start</button>
            </div>
          </div>
          </form>
        </div>
        </div>
      </div>
    </div>;
  }
}

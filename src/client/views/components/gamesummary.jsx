'use strict';

import React from 'react';
import { Link } from 'react-router';

const Constants = require('../../utils/constants.js');

export class GameSummary extends React.Component {
    constructor(props) {
        super(props);
        this._buildGameRow = this._buildGameRow.bind(this);
        this._isGameComplete = this._isGameComplete.bind(this);
        this._addResumeLink = this._addResumeLink.bind(this);
        this._addDeleteLink = this._addDeleteLink.bind(this);
        this._handleMarkComplete = this._handleMarkComplete.bind(this);
        this._handleDelete = this._handleDelete.bind(this);
        this._markGameAsComplete = this._markGameAsComplete.bind(this);
        this._disableBtn = this._disableBtn.bind(this);
        this._removeGameFromUI = this._removeGameFromUI.bind(this);
        this.state = {
          rows: [],
        }
    }

    _buildGameRow(game) {
      return (
          <tr key={game._id} id={game._id}>
            <td name={game._id} className='clickable-row'>{game.type}</td>
            <td name={game._id} className='clickable-row'>{game.score}</td>
            <td name={game._id} className='clickable-row'>{game.num_moves}</td>
            {this._addResumeLink(game._id, game.status)}
            {this._addDeleteLink(game._id)}
          </tr>
      );
    }

    _isGameComplete(game_status) {
     return game_status === Constants.STATUS_WON || game_status === Constants.STATUS_LOST; 
   }

    _addResumeLink(game_id, game_status) {
      if (!this.props.isActiveUserProfile) return;
      let className = 'btn btn-success '
      className += this._isGameComplete(game_status) ?  'disabled' : null;
      return (
        <td><Link
          name={game_id}
          className={className}
          to={'/game?id=' + game_id}
        >Resume</Link></td>
      );
    }

    _addDeleteLink(game_id) {
      if (!this.props.isActiveUserProfile) return;
      return (
        <td><button
          name={game_id}
          className='btn btn-danger deleteGame'
          onClick={this._handleDelete}
        >Delete</button></td>
      );
    }

    _handleMarkComplete(event) {
      event && event.preventDefault();
      let buttonId = event.target.id;
      this._markGameAsComplete(event.target.name, () => {this._disableBtn(buttonId)});
    }

    _disableBtn(buttonId) {
        $('#' + buttonId).addClass('disabled');
    }

    _handleDelete(event) {
      event && event.preventDefault();
      let buttonId = event.target.id;
      let gameId = event.target.name;
      this._deleteGame(gameId, () => {this._removeGameFromUI(gameId)});
    }

    _removeGameFromUI(gameId) {
      this.props.onGameDelete(gameId);
    }
    
    _markGameAsComplete(game_id, onSuccess) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/v1/game/complete/' + game_id,
        data: {
          username: this.props.username,
        },
        success: res => { onSuccess() },
        error: err => { console.log(err) },
      });
    }
    
    _deleteGame(game_id, onSuccess) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: '/v1/game/delete/' + game_id,
        data: {
          username: this.props.username,
        },
        success: res => { onSuccess() },
        error: err => { console.log(err) },
      });
    }
    
    render() {
        return <div className='game-preview-container'>
          <table className='table table-hover'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
                <th>Moves</th>
              </tr>
            </thead>
            <tbody>
              {this.props.games.map(game => this._buildGameRow(game))}
            </tbody>
          </table>
        </div>;
    }
}

GameSummary.proptypes = {
  games: React.PropTypes.array.isRequired,
  username: React.PropTypes.string.isRequired,
  onGameDelete: React.PropTypes.func.isRequired,
}

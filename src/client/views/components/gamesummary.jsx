'use strict';

import React from 'react';
import { Link } from 'react-router';

export class GameSummary extends React.Component {
    constructor(props) {
        super(props);
        this._buildGameRow = this._buildGameRow.bind(this);
        this._getDurationInMinutes = this._getDurationInMinutes.bind(this);
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
      let curr_date = new Date();
      let className = 'btn btn-warning markGameAsComplete '
      className += game.status === 'complete' ?  'disabled' : null;
      return (
          <tr key={game._id} id={game._id}>
            <td name={game._id} className='clickable-row'>{game.type}</td>
            <td name={game._id} className='clickable-row'>{game.createdAt}</td>
            <td name={game._id} className='clickable-row'>
              {this._getDurationInMinutes(
                game.endDate && new Date(game.endDate) || curr_date,
                new Date(game.createdAt)
              )}
            </td>
            <td name={game._id} className='clickable-row'>{game.num_moves}</td>
            <td>
              <button
                id={'complete-' + game._id}
                name={game._id}
                className={className}
                onClick={this._handleMarkComplete}
              >
              Completed
              </button>
            </td>
            <td><button
              name={game._id}
              className='btn btn-danger deleteGame'
              onClick={this._handleDelete}
            >Delete</button></td>
            <td><Link
              name={game._id}
              className='btn btn-success'
              to={'/game?id=' + game._id}
            >Resume</Link></td>
          </tr>
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
       // e && e.preventDefault()
       // console.log('delete');
       // this._deleteGame(e.target.id);
       // //reload games after delete
       // location.reload();
    }

    _removeGameFromUI(gameId) {
      this.props.onGameDelete(gameId);
    }
    
    _markGameAsComplete(game_id, onSuccess) {
      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/v1/game/complete/" + game_id,
        data: {
          username: this.props.username,
        },
        success: res => { onSuccess() },
        error: err => { console.log(err) },
      });
    }
    
    _deleteGame(game_id, onSuccess) {
      $.ajax({
        type: "POST",
        dataType: "json",
        url: "/v1/game/delete/" + game_id,
        data: {
          username: this.props.username,
        },
        success: res => { onSuccess() },
        error: err => { console.log(err) },
      });
    }
    
    _getDurationInMinutes(date1, date2) {
      let timeDiff = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(timeDiff / (1000 * 60));
    }

    render() {
        return <div>
          <h4>Current Games</h4>
          <table className="table table-hover" id="game-preview-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>Duration (minutes)</th>
                <th>Number of Moves</th>
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

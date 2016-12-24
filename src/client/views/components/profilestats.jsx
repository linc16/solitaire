'use strict';

import React from 'react';

export class ProfileStats extends React.Component {
  constructor(props) {
      super(props);
  }

  render() {
    return <div>
      <div className='row profile-info'>
        <div className='col-xs-3'>
          <span>Games Played:</span>
        </div>
        <div className='col-xs-6'>
          <span>{this.props.games_played}</span>
        </div>
      </div>
      <div className='row profile-info'>
        <div className='col-xs-3'>
          <span>Win Ratio:</span>
        </div>
        <div className='col-xs-6'>
          <span>{this.props.win_ratio}</span>
        </div>
      </div>
      <div className='row profile-info'>
        <div className='col-xs-3'>
          <span>Fastest Win:</span>
        </div>
        <div className='col-xs-6'>
          <span>{this.props.fastest_win}</span>
        </div>
      </div>
      <div className='row profile-info'>
        <div className='col-xs-3'>
          <span>Highest Score:</span>
        </div>
        <div className='col-xs-6'>
          <span>{this.props.max_score}</span>
        </div>
      </div>
    </div>;
  }
}

ProfileStats.proptypes = {
  fastest_win: React.PropTypes.String,
  games_played: React.PropTypes.String,
  max_score: React.PropTypes.String,
  win_ratio: React.PropTypes.String,
}

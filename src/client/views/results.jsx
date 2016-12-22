'use strict';

import React from 'react';
import { Link } from 'react-router';

export class Results extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        console.log(this.props);
    }

    render() {
        return <div>
            <div class="form-container">
              <div class="results-info">
                <div class="row results-header">
                  <h3>Game Summary</h3>
                </div>
                <div class="row results">
                  <table class="table-striped results-table">
                    <tr>
                      <td>
                        <span>Duration:</span>
                      </td>
                      <td>
                        <span class="results-value" id="duration"></span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Number of Moves:</span>
                      </td>
                      <td>
                        <span class="results-value">142</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Points:</span>
                      </td>
                      <td>
                        <span class="results-value" id="points"></span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Cards Remaining:</span>
                      </td>
                      <td>
                        <span class="results-value">3</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span>Able to Move:</span>
                      </td>
                      <td>
                        <span class="results-value">False</span>
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="row result-links-row">
                  <div class="col-sm-6 result-links">
                    <Link
                      className="btn btn-default"
                      to='/start'
                    >Start Game</Link>
                  </div>
                  <div class="col-sm-6 result-links">
                    <Link
                      className="btn btn-default"
                      to='/profile'
                    >Profile</Link>
                  </div>
                </div>
              </div>
            </div>
        </div>;
    }
}

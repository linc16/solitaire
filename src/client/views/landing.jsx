'use strict';

import React from 'react';
import { Link } from 'react-router';

export class Landing extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        console.log(this.props);
    }

    render() {
        return <div>
            <div> 
              <div className="form-container homepage homepage-container">
                <div className="container">
                <div className="row homepage-menu">
                  <h1 className="homepage_ad">Win up to $1,000,000 for only $30 a month</h1>
                </div>
                <div className="row myrow homepage-menu">
                  <div className="col-md-6 result-links">
                    <Link className="btn btn-primary btn-lg homepage-btn" to='/login'>Login</Link>
                  </div>
                  <div className="col-md-6 result-links">
                    <Link className="btn btn-primary btn-lg homepage-btn" to='/signup'>Register</Link>
                  </div>
                </div>
                <div className="row homepage-menu">
                  <h4 className="homepage_ad">"I quit my job!" - Bill Builderson</h4>
                </div>
                <div className="row homepage-menu">
                  <h4 className="homepage_ad">"I bought my family a trip to Hawaii" - Jeff Coolridge</h4>
                </div>
                <div className="row homepage-menu">
                  <h4 className="homepage_ad">"Most fun I've ever had!" - Rachel Ray</h4>
                </div>
                </div>
              </div>
            </div>
        </div>;
    }
}

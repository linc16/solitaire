import React from 'react'
import { render } from 'react-dom'

// First we import some modules...
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

import { Landing } from './views/landing';
import { Login } from './views/login';
import { SignUp } from './views/signup';
import { StartGame } from './views/startgame';
import { Game } from './views/game';
import { Profile } from './views/profile';
import { Results } from './views/results';
import { Edit } from './views/edit';
import { UserList } from './views/edit';

import styles from './css/main.css';

const userInfo = {
    username: '',
    email: '',
};

class App extends React.Component {
    render() {
        return (<div>
            {this.props.children}
        </div>);
    }
}


// Finally, render with some routes
render((
    <Router history={browserHistory}>
        <Route path="/" component={App} >
            <IndexRoute component={Landing}/>
            <Route path="login" component={Login} />
            <Route path="signup" component={SignUp} />
            <Route path="start" component={StartGame} />
            <Route path="game" component={Game} />
            <Route path="profile" component={Profile} />
            <Route path="results" component={Results} />
            <Route path="edit" component={Edit} />
        </Route>
    </Router>
), document.getElementById('mainDiv'));

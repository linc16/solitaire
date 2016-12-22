import React from 'react';

class User extends React.Component {
    render() {
        return <div>
            <span className="user-name">{this.props.name}</span>
            <span className="user-icon">{this.props.icon}</span>
        </div>;
    }
}

export class UserList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: []
        };
        this.onJoin = this.onJoin.bind(this);
        this.onLeave = this.onLeave.bind(this);
    }

    onJoin(user) {
        console.log('Join: ' + JSON.stringify(user));
        this.setState({ users: _.union(this.state.users, [user]) });
    }

    onLeave(username) {
        console.log('Leave: ' + JSON.stringify(username));
        this.setState({ users: _.reject(this.state.users, user => { return user.name === username }) });
    }
    
    componentWillMount() {
        this.props.dispatcher.on('join', this.onJoin);
        this.props.dispatcher.on('leave', this.onLeave);
        $.ajax({
            method: 'GET',
            url: `/v1/room/#{this.props.room}/users`,
            onSuccess: res => { this.setState({users: res}) },
            onError: err => { console.log(err) },
        });
    }

    componentWillUnmount() {
        this.props.dispatcher.off('join', this.onJoin);
        this.props.dispatcher.off('leave', this.onLeave);
    }

    render() {
        let users = this.state.users.map((user, i) => <User key={i} name={user.name} icon={user.ion}/>);
        return <div>
            <ul id="users">{users}</ul>
        </div>
    }
}

UserList.proptypes = {
  dispatcher: React.PropTypes.object.isRequired,
  room: React.PropTypes.number.isRequired,
}

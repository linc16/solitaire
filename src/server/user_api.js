let _ = require('lodash');
let mongoose = require('mongoose');
let crypto = require('crypto');
let sanitize = require('./sanitize.js');
let User = require('../models/user');
let Game = require('../models/game');

// Handle GET to fetch user information
function handleGet(app) {
  app.get('/v1/user/:username', function(req, res) {
    User.findOne({ 'username': req.params.username.toLowerCase() }, (err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      if (!user) {
          res.status(404).send({ error: 'unknown user' });
          return;
      } else {
          user = _.pick(user, 'username', 'first_name', 'last_name', 'dob', 'address_street', 'address_city', 'address_state', 'address_zip', 'primary_phone', 'primary_email');
          res.status(200).send(user);
      }
    });
  });
}

// Handle GET request for Profile Info
function handleGetProfile(app) {
  app.get('/v1/profile/info', (req, res) => {
    if (!req.query.username) {
      console.log('error: no username');
      res.status(400).send()
      return;
    }
    console.log(req.query.username);
    User.findOne({'username': req.query.username.toLowerCase()}).populate('games').exec((err, user) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      if (!user) {
          res.status(404).send({ error: 'unknown user' });
          return;
      } else {
        let result = _calcPlayerGameInfo(user.games);
        result = _.extend(result, {games: user.games});
        let hash = crypto.createHash('md5').update(user.primary_email).digest('hex');
        result = _.extend(result, {
          city: user.city,
          email_hash: hash,
          first_name: user.first_name,
          last_name: user.last_name,
          primary_email: user.primary_email,
          username: user.username,
        });
        result = _.pickBy(result, (value, key) => !_.isNil(value));
        res.status(200).send(result)
      }
    });
  });
}

function _calcPlayerGameInfo(games) {
  let games_played = games.length;
  let wins = games.filter(game => { return !_.isEmpty(game.winner) }).length;
  let win_ratio = wins / games_played;
  let fastest_win_game = _.minBy(games, game => { return game.endDate - game.createdAt });
  let fastest_win = fastest_win_game && fastest_win_game.endDate - fastest_win_game.createdAt;
  let max_score = _.maxBy(games, game => { return game.score });
  return {
    fastest_win,
    games_played,
    win_ratio,
    wins,
  }
}

// Handle POST to create a new user account
function handleCreate(app) {
  app.post('/v1/user', function(req, res) {
    let data = sanitize.sanitizeJSON(req.body);
    if (!data || !data.username || !data.password || !data.first_name || !data.last_name || !data.primary_email) {
        res.status(400).send({ error: 'username, password, first_name, last_name and primary_email required' });
    } else {
      User.findOne({ $or: [{ 'username': req.body.username.toLowerCase() },
                           { 'primary_email': req.body.primary_email.toLowerCase() }] }, (err, user) => {
        if (err) {
          console.log(err);
          res.status(500).send({ error: 'login error' });
          return;
        }
        if (user) {
            res.status(400).send({ error: 'username already in use' });
            return;
        }
        else {
          let newUser = _.pick(data, 'username', 'first_name', 'last_name', 'password', 'dob', 'address_street', 'city', 'address_state', 'address_zip', 'primary_phone', 'primary_email');
          let user = new User(newUser);
          user.save({}, (err, user) => {
            if (err) {
              console.log('error creating user');
              console.log(err);
              res.status(500).send({ error: 'an error occurred while creating the account' })
              return;
            }
            let session = req.session;
            session.username = req.body.username;
            req.session.save();
            let hash = crypto.createHash('md5').update(user.primary_email).digest('hex');
            res.status(201).send({
                username:       data.username,
                primary_email:  data.primary_email,
                email_hash: hash,
            });
          });
        }
      });
    }
  });
}

// Handle PUT to edit profile information
// Update does not fire the pre save hooks so an updated password won't get hashed
// We currently do not allow people to change their password through the edit profile form, so not
// currently an issue
function handleUpdate(app) {
  app.put('/v1/user', (req, res) => {
    let data = sanitize.sanitizeJSON(req.body);
    let new_username = data.username || req.session.username;
    let new_email = data.primary_email;
    data.tombstoned = data.tombstoned === "on" ? "true" : "false";
    if (!data || 
        !req.session.username) {
        res.status(401).send({ error: 'error editing profile' });
    } else {
      let query = { 'username': req.session.username }
      User.update(query, { $set: data }, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send()
        } else if (!result) {
          console.log('No user found: ' + req.session.username);
          res.status(400).send({ error: 'can\t find user' });
        } else {
          console.log(result);
          console.log('no errors---------------');
          if (data.username) {
            req.session.username = data.username;
          }
          if (!_.isEmpty(new_email)) {
            let hash = crypto.createHash('md5').update(new_email.primary_email).digest('hex');
            res.status(201).send({
              username: new_username,
              primary_email:  new_email,
              email_hash: hash,
            });
            return;
          }
          res.status(201).send({
            username: new_username,
          });
        }
      });
    }
  });
}

module.exports = {
  handleGet,
  handleGetProfile,
  handleCreate,
  handleUpdate,
}

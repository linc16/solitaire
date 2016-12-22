'use strict';

let express         = require('express'),
    bodyParser      = require('body-parser'),
    crypto          = require('crypto'),
    logger          = require('morgan'),
    _               = require('lodash'),
    session         = require('express-session'),
    mongoose        = require('mongoose'),
    shuffle         = require('./shuffle.js'),
    validMoves      = require('./valid_moves.js'),
    game_api        = require('./game_api.js'),
    path            = require('path');


let app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'sldf23SDklscw10c',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: 30*24*60*60*1000,
    httpOnly: false
  },
}));
//app.use(express.static('public'));
let staticPath = path.join(__dirname, '../../public');
app.use(express.static(staticPath));
app.set('view engine', 'pug');
app.set('views', 'src/server/views');

app.use(logger('combined'));

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://192.168.99.100:32773/raymoneo');
let User = require('../models/user');
let Game = require('../models/game');

let users = [
    { username: 'tumbler', password: 'WBush', first_name: 'George', last_name: 'Bush', primary_email: 'decider@bush2.com' },
    { username: 'eagle', password: 'BlueDress', first_name: 'William', last_name: 'Clinton', primary_email: 'slickwilly@clinton.com' },
    { username: 'renegade', password: 'yeswecan', first_name: 'Barak', last_name: 'Obama', primary_email: 'nearly.done@potus.gov' },
    { username: 'timberwolf', password: 'nobroccoli', first_name: 'George', last_name: 'Bush', primary_email: 'nogonnadoit@bush1.com' },
    { username: 'rawhide', password: 'lovenancy', first_name: 'Ronald', last_name: 'Reagan', primary_email: 'gipper@reagan.com' }
];

let games = [];

// Handle GET request for Profile Info
app.get('/v1/profile/info', (req, res) => {
  if (!req.query.username) {
    console.log('error: no username');
    res.status(400).send()
    return;
  }
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
      if (req.query.username === req.session.username) {
        result = _.extend(result, {games: user.games});
      }
      result = _.extend(result, {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        primary_email: user.primary_email,
        city: user.city,
      });
      res.status(200).send(result);
    }
  });
});

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

// Handle GET request for Profile page
//app.get('/profile', (req, res) => {
//  if (!req.query.username) {
//    res.render('profile', {});
//    return;
//  }
//  User.findOne({ 'username': req.query.username.toLowerCase() }, (err, user) => {
//    if (err) {
//      console.log(err);
//      res.status(500).send();
//      return;
//    }
//    if (!user) {
//        res.status(404).send({ error: 'unknown user' });
//    } else {
//      user = _.pick(
//        user,
//        'username',
//        'first_name',
//        'last_name',
//        'city',
//        'primary_email',
//        'fastest_win',
//        'highest_score',
//        'win_ratio',
//        'games_played'
//      );
//      // user is logged in
//      let logged_in_username = req.session.username || '';
//      User.findOne({ 'username': logged_in_username.toLowerCase() }, (err, logged_in_user) => {
//        if (err) {
//          console.log(err);
//          res.status(500).send(err);
//          return;
//        }
//        let email = logged_in_user ? logged_in_user.primary_email.toLowerCase() : '';
//        logged_in_username = logged_in_user ? logged_in_username : null;
//        let hash = crypto.createHash('md5').update(email).digest('hex');
//        let profile_user_hash = crypto.createHash('md5').update(user.primary_email).digest('hex');
//        user = _.extend(user, { logged_in_username, hash, profile_user_hash });
//        console.log(user);
//        res.render('profile', user); 
//        });
//    }
//  });
//});

// Handle POST to create a user session
app.post('/v1/session', function(req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400).send({ error: 'username and password required' });
    } else {
        User.findOne({ 'username': req.body.username.toLowerCase() }, (err, user) => {
          if (err) {
            console.log(err);
            res.status(500).send({ error: 'login error' });
          }
          else if (!user || !user.validatePassword(req.body.password)) {
              if (user) console.log('It the password: ' + user.password + ' vs. ' + req.body.password);
              else console.log('No user found: ' + req.body.username);
              res.status(401).send({ error: 'unauthorized' });
          } else {
              let session = req.session;
              if (session.username) {
                req.session.touch();
              }
              else {
                session.username = req.body.username;
                req.session.save();
              }
              let hash = crypto.createHash('md5').update(user.primary_email).digest('hex');
              res.status(201).send({
                  username:       user.username,
                  primary_email:  user.primary_email,
                  email_hash: hash,
              });
          }
        });
    }
});

// Handle POST to delete a user session
app.post('/v1/logout', function(req, res) {
  if (!req.body || !req.body.username || req.body.username !== req.session.username) {
      res.status(400).send({ error: 'username required' });
  }
  else {
    let session = req.session.destroy();
    res.status(201).send();
  }
});

// Handle POST to create a new user account
app.post('/v1/user', function(req, res) {
    let data = req.body;
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
          console.log('hi')
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

// Handle GET to fetch user information
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

// Shuffing route login
// /v1/game/shuffle
shuffle(app);
app.post('/v1/game/move', (req, res) => {
  if (!req.session.username) {
    res.status(401).send({'err': 'not logged in'});
    return;
  }
  Game.findById(req.body.id).select('state draw_num').exec((err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({'error': err});
      return;
    }
    if (!result) {
      res.status(404).send({'error': 'couln\t find game for id'});
      return;
    }
    let state = _.last(result.state, 1);
    let draw_num = result.draw_num;
    let valid_moves = validMoves(state, draw_num);
    console.log('requested move ' + JSON.stringify(req.body.move));
    let status_code = 400;
    let resp = {'msg': 'failure'};
    valid_moves.forEach( move => {
      console.log(JSON.stringify(move));
      if (_isMoveEqual(move,req.body.move)) {
        status_code = 200;
        resp = {'state': _getNewState(state, move)};
        game_api.updateGameState(resp.state, req.body.id);
        return;
      }
    });
    res.status(status_code).send(resp);
    return;
  });
});

function _isMoveEqual(move, requested_move) {
  return (_isDrawRequest(move) && _isDrawRequest(requested_move) ||
          _isDiscardRequest(move) && _isDiscardRequest(requested_move) ||
          _.isEqual(move, requested_move));
    
}

function _isDrawRequest(move) {
  return (move.src === 'draw' && move.dst === 'discard');
}

function _isDiscardRequest(move) {
  return (move.src === 'discard' && move.dst === 'draw');
}

function _getNewState(state, move) {
  let src = move.src;
  let dst = move.dst;
  let moved_cards = _.takeRight(state[src], move.cards.length);
  state[src] = _.dropRight(state[src], move.cards.length);
  let new_last_card = _.last(state[src]);
  if (new_last_card && src !== 'draw') {
    state[src][state[src].length - 1].up = "true";
  }
  if (dst === 'discard') {
    moved_cards = game_api.flipCards(moved_cards);
  }
  if (dst === 'draw') {
    moved_cards = _.reverse(game_api.flipCards(moved_cards));
  }
  state[dst] = _.concat(state[dst], moved_cards);
  return state;
}
game_api.markGameAsComplete(app);
game_api.deleteGame(app);
game_api.updateGame(app);

// Handle POST to create a new game
app.post('/v1/game', function(req, res) {
    let data = req.body;
    if (!data ||
        !data.type ||
        !data.num_players ||
        !data.name ||
        !data.deck_type ||
        !data.draw_num ||
        !req.session.username) {
        res.status(400).send({ error: 'all form fields required' });
    } else {
        User.findOne({ 'username': req.session.username }, (err, user) => {
          if (err) {
            console.log(err);
            res.status(500).send();
            return;
          }
          if (!user) {
            res.status(404).send({ error: 'unknown user' });
            return;
          }
          data = _.extend(data, { creator: user.id, players: [user] } );
          console.log(data);
          let newGame = new Game(data);
          console.log(newGame);
          newGame.save({}, (err, game) => {
            if (err) {
              console.log('error creating game');
              console.log(err);
              res.status(500).send({ error: 'an error occurred while creating the game' })
              return;
            }
            console.log('new game id: ' + newGame.id);
            User.update({'username': user.username}, { $push: {'games': newGame.id} }, (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send()
              } else if (!result) {
                console.log('No couldn\t update game: ' + req.session.username);
                res.status(400).send({ error: 'No couldn\t update game' });
              } else {
                console.log('game updated ------------');
                console.log(result);
                console.log('no errors---------------');
                res.status(201).send({
                  planid: newGame.id
                });
              }
            });
          });
        });
    }
});

app.get('/v1/info/game', (req, res) => {
    Game.findById(req.query.id).populate('players').exec((err, game) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      console.log(game);
      console.log(req.query.id);
      if (!game) {
          res.status(404).send({ error: 'unknown game id' });
      } else {
        // need to send STATE
        res.render('game-review', game);
      }
    });
});

// Handle GET to fetch game state information
app.get('/v1/game/state/:id', function(req, res) {
    console.log('get game state !!!!!!!!!!!!!!');
    Game.findById(req.params.id).select('state').exec((err, game) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      if (!game) {
          res.status(404).send({ error: 'unknown game id' });
      } else {
        let state = _.last(game.state, 'state');
        res.status(200).send({state});
      }
    });
});

// Handle GET to fetch game information
app.get('/v1/game/:id', function(req, res) {
    Game.findById(req.params.id, (err, game) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      console.log(game);
      console.log(req.params.id);
      if (!game) {
          res.status(404).send({ error: 'unknown game id' });
      } else {
        // need to send STATE
        let gameData = _.pick(game, 'type', 'num_players', 'name', 'deck_type', 'draw_num');
        res.status(200).send(gameData);
      }
    });
});

// Handle POST to edit profile information
app.post('/v1/edit', (req, res) => {
  let data = req.body;
  let clean_data = {}
  let new_username = req.session.username;
  let new_email = data.primary_email;
  for (let key in data) {
    if (!_.isEmpty(data[key]) && key !== 'password') {
      clean_data[key] = data[key];
      if (key === 'username') {
        new_username = data[key];
      }
      if (key === 'primary_email') {
        new_email = data[key];
      }
      if (key === 'tombstoned') {
        clean_data[key] = (data[key] === "on");
      }
    }
  }
  if (!clean_data ||
      !req.session.username) {
      res.status(401).send({ error: 'error editing profile' });
  } else {
    let query = { 'username': req.session.username }
    User.update(query, { $set: clean_data }, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send()
      } else if (!result) {
        console.log('No user found: ' + req.session.username);
        res.status(400).send({ error: 'can\t find user' });
      } else {
        console.log(result);
        console.log('no errors---------------');
        if (clean_data.username) {
          req.session.username = clean_data.username;
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

// Render the base HTML document
app.get('*', function(req, res) {
    res.render('base', {
        title: 'Solitaire'
    });
});

// returns an instance of node-letsencrypt with additional helper methods
var lex = require('letsencrypt-express').create({
  // set to https://acme-v01.api.letsencrypt.org/directory in production
  server: 'staging',
  challenges: { 'http-01': require('le-challenge-fs')
    .create({ webrootPath: '/tmp/acme-challenges' }) },
  store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' }),

  // You probably wouldn't need to replace the default sni handler
  // See https://github.com/Daplie/le-sni-auto if you think you do
  //, sni: require('le-sni-auto').create({})

  approveDomains: approveDomains
});

function approveDomains(opts, certs, cb) {
  // The domains being approved for the first time are listed in opts.domains
  // Certs being renewed are listed in certs.altnames
  if (certs) {
    opts.domains = certs.altnames;
  }
  else {
    opts.email = 'eraymond1411@gmail.com';
    opts.agreeTos = true;
  }
  cb(null, { options: opts, certs: certs });
}

// handles acme-challenge and redirects to https
require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
  console.log("Listening for ACME http-01 challenges on", this.address());
});

// handles your app
require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
  console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});

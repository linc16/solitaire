'use strict';

let express         = require('express'),
    bodyParser      = require('body-parser'),
    crypto          = require('crypto'),
    logger          = require('morgan'),
    _               = require('lodash'),
    session         = require('express-session'),
    mongoose        = require('mongoose'),
    shuffle         = require('./shuffle.js'),
    game_api        = require('./game_api.js'),
    user_api        = require('./user_api.js'),
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

// Shuffing route login
// /v1/game/shuffle
shuffle(app);
game_api.deleteGame(app);
game_api.handleCreate(app);
game_api.handleGet(app);
game_api.handleGetState(app);
game_api.handleMove(app);
game_api.handleUpdate(app);
game_api.markGameAsComplete(app);

user_api.handleCreate(app);
user_api.handleGet(app);
user_api.handleGetProfile(app);
user_api.handleUpdate(app);

// Render the base HTML document
app.get('*', function(req, res) {
    res.render('base', {
        title: 'Solitaire'
    });
});

let server = app.listen(8080, function () {
    console.log('Example app listening on ' + server.address().port);
});

let _ = require('lodash');
let mongoose = require('mongoose');
let validMoves = require('./valid_moves.js');
let sanitize = require('./sanitize.js');
let Constants = require('./constants.js');
let User = require('../models/user');
let Game = require('../models/game');

// Handle POST to mark game as complete
function markGameAsComplete(app) {
  app.post('/v1/game/complete/:id', (req, res) => {
    let data = sanitize.sanitizeJSON(req.body);
    if (!data ||
        !req.session.username || data.username != req.session.username) {
        res.status(400).send({ error: 'error updating game' });
    } else {
      let query = { '_id': req.params.id }
      Game.update(query, {'status': 'complete', 'endDate': new Date()}, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send()
        } else if (!result) {
          console.log('No game found: ' + req.params.id);
          res.status(400).send({ error: 'can\t find game' });
        } else {
          console.log('no errors---------------');
          res.status(201).send({msg: 'success'});
        }
      });
    }
  });
}

// Handle POST to delete game
function deleteGame(app) {
  app.post('/v1/game/delete/:id', (req, res) => {
    let data = req.body;
    if (!data ||
        !req.session.username || data.username != req.session.username) {
        res.status(400).send({ error: 'error deleting game' });
    } else {
      Game.findById(req.params.id).remove().exec((err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send()
        } else if (!result) {
          console.log('No game found: ' + req.params.id);
          res.status(400).send({ error: 'can\t find game' });
        } else {
          console.log(result);
          console.log('no errors---------------');
          res.status(201).send({msg: 'successful delete'});
        }
      });
    }
  });
}

function updateGameState(state, id, next) {
  let query = { '_id': id };
  state = _.defaults(state, {
    'draw': [],
    'discard': [],
    'pile1': [],
    'pile2': [],
    'pile3': [],
    'pile4': [],
    'pile5': [],
    'pile6': [],
    'pile7': [],
    'stack1': [],
    'stack2': [],
    'stack3': [],
    'stack4': [],
  });
  Game.update(query, { $push: {'state': state} }, (err, result) => {
    if (err) {
      console.log(err);
      if (next) next({'error': err}, 500);
    } else if (!result) {
      console.log('No game found: ' + id);
      if (next) next({'error': err}, 400);
    } else {
      console.log(result);
      console.log('no errors---------------');
      if (next) next({"msg": "success"}, 200);
    }
  });
}

function handleUpdate(app) {
  app.put('/v1/game/:id', (req, res) => {
    let data = sanitize.sanitizeJSON(req.body);
    if (!data ||
        !req.session.username || !data.state) {
        res.status(400).send({ error: 'error updating game' });
    } else {
      let next = function(resp, status) {
        res.status(status).send(resp)
      }
      updateGameState(data.state, req.params.id, next);
    }
  });
}

function handleMove(app) {
  app.put('/v1/game/move', (req, res) => {
    let data = sanitize.sanitizeJSON(req.body);
    if (!req.session.username) {
      res.status(401).send({'err': 'not logged in'});
      return;
    }
    Game.findById(data.id).select('state draw_num').exec((err, result) => {
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
      let resp = {'msg': 'not a valid move'};
      valid_moves.forEach( move => {
        console.log(JSON.stringify(move));
        if (_isMoveEqual(move,req.body.move)) {
          status_code = 200;
          resp = {'state': _getNewState(state, move)};
          updateGameState(resp.state, req.body.id);
          update_query = {$inc: { 'num_moves':1}};
          if (_.includes(move.dst, 'stack')) {
            update_query = {$inc: { 'num_moves':1, 'score':1}};
          }
          if (_isGameWon(resp.state)) {
            resp = _.extend(resp, { status: Constants.STATUS_WON });
            update_query = _.extend(update_query, {'status': Constants.STATUS_WON});
          }
          Game.update({'_id': data.id}, update_query, (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send()
            } else if (!result) {
              console.log('No game found: ' + data.id);
            } else {
              console.log('no errors---------------');
              console.log('game updated: ' + data.id);
            }
          });
          return;
        }
      });
      res.status(status_code).send(resp);
      return;
    });
  });
}

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
    moved_cards = flipCards(moved_cards);
  }
  if (dst === 'draw') {
    moved_cards = _.reverse(flipCards(moved_cards));
  }
  state[dst] = _.concat(state[dst], moved_cards);
  return state;
}

function flipCards(cards) {
  return _.map(cards, card => {
    card.up = card.up === 'true' ? 'false' : 'true';
    return card;
  });
}

function _isGameWon(state) {
   for (let i = 1; i <= Constants.NUM_STACKS; ++i) {
     if (state['stack' + i].length < 13) return false;
   }
   return true;
}

// Handle POST to create a new game
function handleCreate(app) {
  app.post('/v1/game', function(req, res) {
    let data = sanitize.sanitizeJSON(req.body);
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
}

// Handle GET to fetch game information
function handleGet(app) {
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
}

// Handle GET to fetch game state information
function handleGetState(app) {
  app.get('/v1/game/:id/state', function(req, res) {
    Game.findById(req.params.id).select('state').exec((err, game) => {
      if (err) {
        console.log(err);
        res.status(500).send();
        return;
      }
      if (!game) {
        res.status(404).send({ error: 'unknown game id' });
      } else {
        console.log(game);
        let state = _.last(game.state, 'state');
        console.log('----------- state ---------------');
        console.log('state ' + JSON.stringify(state));
        res.status(200).send({"state": state});
      }
    });
  });
}

module.exports = {
  deleteGame,
  handleCreate,
  handleGet,
  handleGetState,
  handleMove,
  handleUpdate,
  markGameAsComplete,
}

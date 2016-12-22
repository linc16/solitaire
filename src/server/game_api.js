let _ = require('lodash');
let mongoose = require('mongoose');
let User = require('../models/user');
let Game = require('../models/game');

// Handle POST to mark game as complete
function markGameAsComplete(app) {
  app.post('/v1/game/complete/:id', (req, res) => {
    let data = req.body;
    console.log('session username: ' + req.session.username);
    console.log('data username: ' + data.username);
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
      if (next) next({}, 200);
    }
  });
}

function updateGame(app) {
  app.put('/v1/game/:id', (req, res) => {
    let data = req.body;
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

function flipCards(cards) {
  return _.map(cards, card => {
    card.up = card.up === 'true' ? 'false' : 'true';
    return card;
  });
}

module.exports = {
  deleteGame,
  markGameAsComplete,
  updateGame,
  updateGameState,
  flipCards,
}

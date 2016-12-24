const _  = require('lodash');
const Constants = require('./constants.js');

let validMoves = function(state, draw_num) {
  let results = [];
  results = _.concat(results, _getMovesFromPiles(state));
  
  let cards_to_draw =  _.map(_.takeRight(state['draw'], draw_num), card => {
    return _.pick(card, ['suite', 'value'])
  });
  
  results = _.concat(results, _getMovesFromDiscard(state, _.isEmpty(cards_to_draw)));
  results = _.concat(results, _getMovesFromDraw(state, cards_to_draw));
  
  return results;
};

function _oppositeColor(card1, card2) {
  return (_.includes(['spades', 'clubs'], card1.suite.toLowerCase()) &&
          _.includes(['diamonds','hearts'], card2.suite.toLowerCase()) ||
          _.includes(['diamonds','hearts'], card1.suite.toLowerCase()) &&
          _.includes(['spades','clubs'], card2.suite.toLowerCase()));
}

function _sameSuite(card1, card2) {
  return card1.suite === card2.suite;
}

function _isValidMove(curr_card, dst_card, dst_pile_type) {
  if (dst_pile_type === 'pile') {
    if (!dst_card) return parseInt(curr_card.value) === 13;
    return (
      _oppositeColor(curr_card, dst_card) &&
      parseInt(curr_card.value) === parseInt(dst_card.value) - 1
    );
  } else if (dst_pile_type === 'stack') {
    if (!dst_card) return parseInt(curr_card.value) === 1;
    return (
      _sameSuite(curr_card, dst_card) &&
      parseInt(curr_card.value) === (parseInt(dst_card.value) + 1)
    );
  }
}

function _getMovesFromPiles(state) {
  moves = []
  for (let i = 1; i <= Constants.NUM_PILES; ++i) {
    let pile = 'pile' + i;
    let new_moves = _getMovesFromPileToPile(state, i);
    moves = _.concat(moves, new_moves);
    if (_.isEmpty(state[pile])) continue;
    moves = _.concat(moves, _getMovesFromPileToStack(state, pile));
  }
  return moves;
}

function _getMovesFromPileToPile(state, pile_num) {
  let pile = 'pile' + pile_num;
  let moves = [];
  for (let j = state[pile].length - 1; j >= 0; --j) {
    let curr_card = state[pile][j];
    let num_cards_selected = state[pile].length - j;
    if (!(curr_card.up === 'true')) {
      break;
    }
    for (let k = 1; k <= Constants.NUM_PILES; ++k) {
      if (k !== pile_num) {
        let dst_pile = 'pile' + k;
        let dst_card = _.last(state[dst_pile]);
        if (!dst_card || dst_card.up === 'true') {
          if (_isValidMove(curr_card, dst_card, 'pile')) {
            let cards = _.takeRight(state[pile], num_cards_selected);
            cards = _.map(cards, card => { return _.pick(card, ['suite', 'value']) });
            moves.push({'cards': cards, 'src': pile, 'dst': dst_pile});
          }
        }
      }
    }
  }
  return moves;
}

function _getMovesFromPileToStack(state, pile) {
  let moves = [];
  let curr_card = _.last(state[pile]);
  let num_cards_selected = 1;
  for (let k = 1; k <= Constants.NUM_STACKS; ++k) {
    let dst_stack_name = 'stack' + k;
    dst_stack = state[dst_stack_name];
    let dst_card = _.last(dst_stack);
    if (_isValidMove(curr_card, dst_card, 'stack')) {
      let cards = _.takeRight(state[pile], num_cards_selected);
      cards = _.map(cards, card => { return _.pick(card, ['suite', 'value']) });
      moves.push({'cards': cards, 'src': pile, 'dst': dst_stack_name});
    }
  }
  return moves;
}

function _getMovesFromDiscard(state, isDrawEmpty) {
  let moves = [];
  let discard_card = _.last(state['discard']);
  if (!_.isEmpty(discard_card)) {
    moves = _.concat(moves, _getMovesForCard(state, discard_card, 'discard', 'pile', Constants.NUM_PILES));
    moves = _.concat(moves, _getMovesForCard(state, discard_card, 'discard', 'stack', Constants.NUM_STACKS));
  }
  if (isDrawEmpty) {
    moves.push({
      'cards': _.map(state['discard'], card => { return _.pick(card, ['suite', 'value']) }),
      'src': 'discard',
      'dst': 'draw',
    });
  }
  return moves;
}

function _getMovesFromDraw(state, cards) {
  if (_.isEmpty(cards)) return [];
  let src = 'draw';
  let dst = 'discard';
  return [{
    'cards': cards,
    'src': src,
    'dst': dst,
  }];
}

function _getMovesForCard(state, card, src, dst_type, num_dsts) {
  let moves = []
  for (let k = 1; k <= num_dsts; ++k) {
    let dst_pile = dst_type + k;
    let dst_card = _.last(state[dst_pile]);
    if (_isValidMove(card, dst_card, dst_type)) {
      moves.push({
        'cards': [_.pick(card,['suite', 'value'])],
        'src': src,
        'dst': dst_pile,
      });
    }
  }
  return moves;
}

module.exports = validMoves;

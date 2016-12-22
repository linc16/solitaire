const _  = require('lodash');

let validMoves = function(state, draw_num) {
  let results = [];
  let num_stacks = 4;
  let num_piles = 7;
  results = _.concat(results, _getMovesFromPiles(state));
  let discard_card = _.last(state['discard']);
  if (!_.isEmpty(discard_card)) {
    results = _.concat(results, _getMovesForCard(state, discard_card, 'discard', 'pile', num_piles));
    results = _.concat(results, _getMovesForCard(state, discard_card, 'discard', 'stack', num_stacks));
  }
  for (let i = 1; i <= num_stacks; ++i) {
    let stack = 'stack' + i;
    let curr_card = _.last(state[stack]);
    if (_.isEmpty(curr_card)) continue;
    let num_cards_selected = 1;
    results = _.concat(results, _getMovesForCard(state, curr_card, stack, 'pile', num_piles));
  }
  let cards = _.takeRight(state['draw'], draw_num);
  cards = _.map(cards, card => { return _.pick(card, ['suite', 'value']) });
  let src = 'draw';
  let dst = 'discard';
  if (_.isEmpty(cards)) {
    src = 'discard';
    dst = 'draw';
    cards = _.map(state['discard'], card => { return _.pick(card, ['suite', 'value']) });
  }
  results.push({
    'cards': cards,
    'src': src,
    'dst': dst,
  });
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
  let num_piles = 7;
  let num_stacks = 4;
  moves = []
  for (let i = 1; i <= num_piles; ++i) {
    let pile = 'pile' + i;
    console.log(moves);
    let new_moves = _getMovesFromPileToPile(state, i, num_piles);
    console.log(new_moves);
    moves = _.concat(moves, new_moves);
    if (_.isEmpty(state[pile])) continue;
    moves = _.concat(moves, _getMovesFromPileToStack(state, pile, num_stacks));
  }
  return moves;
}

function _getMovesFromPileToPile(state, pile_num, num_piles) {
  let pile = 'pile' + pile_num;
  let moves = [];
  for (let j = state[pile].length - 1; j >= 0; --j) {
    let curr_card = state[pile][j];
    let num_cards_selected = state[pile].length - j;
    if (!(curr_card.up === 'true')) {
      break;
    }
    for (let k = 1; k <= num_piles; ++k) {
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

function _getMovesFromPileToStack(state, pile, num_stacks) {
  let moves = [];
  let curr_card = _.last(state[pile]);
  let num_cards_selected = 1;
  for (let k = 1; k <= num_stacks; ++k) {
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

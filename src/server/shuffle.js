module.exports = (app) => {
  
  function build_deck(includeJokers) {
    let min_card = 1,
        max_card = 13;
    let suites = ['hearts', 'diamonds', 'clubs', 'spades'];
    let deck = []
    for (let i = min_card; i <= max_card; ++i) {
      suites.forEach( (suite) => {
        deck.push({ 'suite': suite, 'value': i });
      });
    }
    if (includeJokers === 'true') {
      let joker = { 'suite': 'joker', 'value': 'joker' }
      deck.push(joker);
      deck.push(joker);
    }
    return deck;
  }
  
  function _shuffle_deck(deck) {
    let j, tmp;
    for (let i = deck.length - 1; i >= 0; --i) {
      j = Math.floor(Math.random() * i);
      tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }
    return deck;
  }
  app.get('/v1/game/shuffle', (req, res) => {
    res.status(200).send(_shuffle_deck(build_deck(req.query.jokers)));
  });
}

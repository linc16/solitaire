'use strict';

import React from 'react';
import { Link } from 'react-router';


export class Game extends React.Component {
  constructor(props) {
    super(props);
    this.initGameState = this.initGameState.bind(this);
    this._initializeCards = this._initializeCards.bind(this);
    this._insertPilePlaceholder = this._insertPilePlaceholder.bind(this);
    this._postGameState = this._postGameState.bind(this);
    this._getGameStateFromDB = this._getGameStateFromDB.bind(this);
    this.addCardContainerClickHandler = this.addCardContainerClickHandler.bind(this);
    this._onMoveSuccess = this._onMoveSuccess.bind(this);
    this._handleSelectCards = this._handleSelectCards.bind(this);
    this._getSelectedCardIds = this._getSelectedCardIds.bind(this);
    this._isCardSelectable = this._isCardSelectable.bind(this);
    this._isDrawPile = this._isDrawPile.bind(this);
    this._isCardFaceDown = this._isCardFaceDown.bind(this);
    this._handleDeselectCards = this._handleDeselectCards.bind(this);
    this._getCardRankFromValue = this._getCardRankFromValue.bind(this);
    this._placeCardInPile = this._placeCardInPile.bind(this);
    this._getCardDepthFromContainerId = this._getCardDepthFromContainerId.bind(this);
    this._getCardPileNumFromContainerId = this._getCardPileNumFromContainerId.bind(this);
    this._getCardPileTypeFromContainerId = this._getCardPileTypeFromContainerId.bind(this);
    this._getNextCardOffset = this._getNextCardOffset.bind(this);
    this._getParentPileId = this._getParentPileId.bind(this);
    this._getSelectedCards = this._getSelectedCards.bind(this);
    this._highlight = this._highlight.bind(this);
    this._removeHighlight = this._removeHighlight.bind(this);
    this._inSamePile = this._inSamePile.bind(this);
    this._isMoveValid = this._isMoveValid.bind(this);
    this._getGameState = this._getGameState.bind(this);
    this._setGameState = this._setGameState.bind(this);
    this._getParameterFromUrl = this._getParameterFromUrl.bind(this);
    this._clearCards = this._clearCards.bind(this);
    this._getProfileLink = this._getProfileLink.bind(this);
  }

  componentDidMount() {
    this.initGameState();
  }

  initGameState() {
    let stored_state_game_id = localStorage.getItem('gameId');
    if (stored_state_game_id !== this._getParameterFromUrl('id')) {
      this._getGameStateFromDB(this._initializeCards);
    } else {
      this._initializeCards();
    }
  }

//$(document).keyup(function(e) {
//  if (e.keyCode == 27) { // escape key maps to keycode `27`
//    _removeHighlight(selectEvent.cards);
//    localStorage.setItem('selectEvent', JSON.stringify({}));
//  }
//});

  _initializeCards() {
    let num_piles = 7;
    for (let i = 1; i <= num_piles; ++i) {
      this._insertPilePlaceholder('pile',i);
      let cards = JSON.parse(localStorage.getItem('pile' + i));
      let offset = 0;
      for (let j = 0; j < cards.length; ++j) {
        let card = cards[j];
        let container_id = "card-" + (j+1) + "-pile-" + i;
        this._placeCardInPile(card, container_id, 'pile' + i, offset);
        offset += 25;
      }
    }
   
    this._insertPilePlaceholder('draw');
    let draw_cards = JSON.parse(localStorage.getItem('draw'));
    for (let i = 0; i < draw_cards.length; ++i) {
      let container_id = 'card-' + (i+1) + '-draw-0';
      this._placeCardInPile(draw_cards[i], container_id, 'draw', 0);
    };
    
    this._insertPilePlaceholder('discard');
    let discard_cards = JSON.parse(localStorage.getItem('discard'));
    for (let i = 0; i < discard_cards.length; ++i) {
      let container_id = 'card-' + (i+1) + '-discard-0';
      this._placeCardInPile(discard_cards[i], container_id, 'discard', 0);
    };
  
    let num_stacks = 4;
    for (let i = 1; i <= num_stacks; ++i) {
      this._insertPilePlaceholder('stack',i);
      let cards = JSON.parse(localStorage.getItem('stack' + i));
      for (let j = 0; j < cards.length; ++j) {
        let card = cards[j];
        let container_id = "card-" + (j+1) + "-stack-" + i;
        this._placeCardInPile(card, container_id, 'stack' + i, 0);
      }
    }
    this.addCardContainerClickHandler();
    //addCardContainerDragHandler();
  }

  _insertPilePlaceholder(pileType, pileNum = '') {
    let placeholder = `
      <div id='card-0-${pileType}-${pileNum}' class='card-container container-placeholder'>
        <img class='card placeholder' src='img/2_of_clubs.png'>
      </div>
    `
    $(`#${pileType}${pileNum}`).append(placeholder);
  }

  _postGameState() {
    let state = this._getGameState();
    let id = this._getParameterFromUrl('id');
    $.ajax({
      type: "PUT",
      dataType: "json",
      url: "/v1/game/" + id,
      data: {
        state,
      },
      success: res => {
        console.log(res);
      },
      error: err => {
        console.log('err: ' + JSON.stringify(err));
      },
    });
  }

  _getGameStateFromDB(onSuccess) {
    let id = this._getParameterFromUrl('id');
    $.ajax({
      type: "GET",
      dataType: "json",
      url: `/v1/game/state/${id}`,
      success: res => {
        console.log(res);
        this._setGameState(res.state);
        localStorage.setItem('gameId', id);
        onSuccess();
      },
      error: err => {
        console.log('err: ' + JSON.stringify(err));
      },
    });
  }

  addCardContainerClickHandler() {
    $('.card-container').click( e => {
      let selectEvent = localStorage.getItem('selectEvent') || '{}';
      selectEvent = JSON.parse(selectEvent);
      if (_.isEmpty(selectEvent) && !(_.includes(e.target.classList, 'placeholder'))) {
        console.log('select'); 
        this._handleSelectCards(e.delegateTarget.id);
      } else if (!_.isEmpty(selectEvent)) {
        selectEvent['dst'] = e.delegateTarget.id;
        let src = this._getParentPileId('#' + selectEvent.src);
        let dst = this._getParentPileId('#' + selectEvent.dst);
        let cardDepth = parseInt(this._getCardDepthFromContainerId(selectEvent.src));
        let pile = JSON.parse(localStorage.getItem(src))
        console.log(pile);
        let numCardsSelected = pile.length - cardDepth + 1;
        let cards = _.takeRight(pile, numCardsSelected);
        cards = _.map(cards, card => { return _.pick(card, ['suite', 'value']) });
        let move = {
          'cards': cards,
          'src': src,
          'dst': dst,
        }
        this._isMoveValid(
          move,
          (res) => { this._onMoveSuccess(res, selectEvent, e.delegateTarget.id) },
          () => { 
            this._removeHighlight(selectEvent.cards);
            localStorage.setItem('selectEvent', JSON.stringify({}));
          }
        );
      }
    });
  }

  _onMoveSuccess(res, selectEvent, targetId) {
    this._setGameState(res.state);
    this._clearCards();
    this._initializeCards();
    localStorage.setItem('selectEvent','{}');
  }

  _handleSelectCards(src) {
    if (!this._isCardSelectable(src)) return;
    //let cardIds = _getSelectedCardIds(src);
    console.log('src: ' + src);
    let cardDepth = parseInt(this._getCardDepthFromContainerId(src));
    let cards = this._getSelectedCards('#' + this._getParentPileId('#' + src), cardDepth)
      .map((_, card) => { return '#' + card.id; })
      .get();
    let selectEvent = {
      'cards': cards,
      'src': src,
    }
    localStorage.setItem('selectEvent', JSON.stringify(selectEvent));
    this._highlight(cards);
  }

  _getSelectedCardIds(src) {
    let cardDepth = parseInt(this._getCardDepthFromContainerId(src));
    let cards = this._getSelectedCards('#' + this._getParentPileId('#' + src), cardDepth)
      .map((_, card) => { return '#' + card.id; })
      .get();
    return cards;
  }

  _isCardSelectable(src) {
    console.log('src: ' + src);
    return (!this._isCardFaceDown(src) || this._isDrawPile(src));
  }

  _isDrawPile(src) {
    console.log('draw pile');
    return _.includes(this._getParentPileId('#' + src), 'draw');
  }

  _isCardFaceDown(src) {
    console.log('face down');
    return _.includes($(`#${src}`).children().attr('src'), 'card-back')
  }

  _handleDeselectCards(selectEvent, dst) {
    if (this._inSamePile('#'+selectEvent.src, '#'+dst)) {
      localStorage.setItem('selectEvent', JSON.stringify({}));
      this._removeHighlight(selectEvent.cards);
      return;
    }
    let dstId = '#'+dst
    let cardDepth = parseInt(this._getCardDepthFromContainerId(dstId)) + 1;
    let cardPileType = this._getCardPileTypeFromContainerId(dstId);
    let cardPileNum = this._getCardPileNumFromContainerId(dstId, cardPileType);
    this._removeHighlight(selectEvent.cards);
    this._insertCardsAfterContainer(
      selectEvent.cards,
      dstId,
      cardPileType,
      cardPileNum,
      cardDepth
    );
    $('#'+selectEvent.src).remove();
    localStorage.setItem('selectEvent', JSON.stringify({}));
  }

  _getCardRankFromValue(value) {
    switch(value) {
      case 1:
        return "ace";
      case 11:
        return "jack";
      case 12:
        return "queen";
      case 13:
        return "king";
      default:
        return value;
    }
  }

  _placeCardInPile(card, container_id, pile, offset) {
    let value = this._getCardRankFromValue(parseInt(card.value));
    let img_id = value + '_of_' + card.suite;
    let img_src_path = card.up.toString() === 'true' ? img_id : 'card-back';
    let draggable = card.up.toString() === 'true' ? 'draggable' : '';
    if (container_id) {
      let img = "<img class='card' id=" + img_id + " src=img/" + img_src_path + ".png>";
      let container = "<div id='" + container_id + "' class='card-container'></div>";
      $("#" + pile).append(container);
      $("#" + container_id).append(img);
      $("#" + container_id).css({
        'position': 'absolute',
        'margin-top': offset + 'px',
      });
      return;
    }
    let img = "<img class='card' style='position: absolute' id=" + img_id + " src=img/" + img_src_path + ".png>";
    $("#" + pile).append(img);
  }

  _getCardDepthFromContainerId(card_container_id) {
    let regex = new RegExp('card-([0-9]+)-');
    let depth = regex.exec(card_container_id);
    return depth && depth[1];
  }

  _getCardPileNumFromContainerId(cardContainerId, pileType) {
    let regex = new RegExp(pileType + '-([0-9]+)');
    let depth = regex.exec(cardContainerId);
    return depth && depth[1];
  }

 _getCardPileTypeFromContainerId(cardContainerId) {
   let regex = new RegExp('-([a-z]+)-');
   let type = regex.exec(cardContainerId);
   return type && type[1];
 }

  _getNextCardOffset(dstId, pileType, cardDepth) {
    if (cardDepth === 1 || _.includes(['draw','discard','stack'], pileType)) {
      return 0;
    }
    return parseInt($(dstId).css('margin-top').replace('px','')) + 25
  }

  _getParentPileId(cardContainer) {
    console.log('get parent pile id');
    console.log($(cardContainer).parent().prop('id'));
    return $(cardContainer).parent().prop('id');
  }

  _getSelectedCards(parentPile, cardDepth) {
    let children = $(parentPile).children().slice(cardDepth);
    return children;
  }

  _highlight(cards) {
    cards.forEach( card => {
      $(card).addClass('highlighted');
    });
  }

  _removeHighlight(cards) {
    cards.forEach( card => {
      $(card).removeClass('highlighted');
    });
  }

  _inSamePile(card1, card2) {
    return $(card1).parent().prop('id') === $(card2).parent().prop('id');
  }

  _isMoveValid(move, onSuccess, onFailure) {
    console.log(JSON.stringify(move));
    let state = this._getGameState();
    let id = this._getParameterFromUrl('id');
    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/v1/game/move",
      data: {
        id,
        move,
      },
      success: res => {
        console.log('success move check');
        console.log(res);
        onSuccess(res);
      },
      error: err => {
        console.log('failed move check');
        console.log('err: ' + JSON.stringify(err));
        onFailure();
      },
    });
  }

  _getGameState() {
    let state = {
      'draw': JSON.parse(localStorage.getItem('draw')),
      'discard': JSON.parse(localStorage.getItem('discard')),
      'pile1': JSON.parse(localStorage.getItem('pile1')),
      'pile2': JSON.parse(localStorage.getItem('pile2')),
      'pile3': JSON.parse(localStorage.getItem('pile3')),
      'pile4': JSON.parse(localStorage.getItem('pile4')),
      'pile5': JSON.parse(localStorage.getItem('pile5')),
      'pile6': JSON.parse(localStorage.getItem('pile6')),
      'pile7': JSON.parse(localStorage.getItem('pile7')),
      'stack1': JSON.parse(localStorage.getItem('stack1')),
      'stack2': JSON.parse(localStorage.getItem('stack2')),
      'stack3': JSON.parse(localStorage.getItem('stack3')),
      'stack4': JSON.parse(localStorage.getItem('stack4')),
    }
    return state;
  }

  _setGameState(state) {
    localStorage.setItem('draw', JSON.stringify(state.draw));
    localStorage.setItem('discard', JSON.stringify(state.discard));
    localStorage.setItem('pile1', JSON.stringify(state.pile1));
    localStorage.setItem('pile2', JSON.stringify(state.pile2));
    localStorage.setItem('pile3', JSON.stringify(state.pile3));
    localStorage.setItem('pile4', JSON.stringify(state.pile4));
    localStorage.setItem('pile5', JSON.stringify(state.pile5));
    localStorage.setItem('pile6', JSON.stringify(state.pile6));
    localStorage.setItem('pile7', JSON.stringify(state.pile7));
    localStorage.setItem('stack1', JSON.stringify(state.stack1));
    localStorage.setItem('stack2', JSON.stringify(state.stack2));
    localStorage.setItem('stack3', JSON.stringify(state.stack3));
    localStorage.setItem('stack4', JSON.stringify(state.stack4));
  }

  _getParameterFromUrl(param) {
    let regex = new RegExp(param + "=([^&]+)");
    let match = window.location.search.match(regex);
    return match ? match[1] : null;
  }

  _clearCards() {
    $('.card-pile').empty();
  }

  _getProfileLink() {
    let username = sessionStorage.getItem('current_user');
    return username && username.length > 0 ?
      '/profile?username=' + username :
      '/profile';
  }

  render() {
    return <div>
      <div onload="setMovableCards()" id="game-container">
        <div className="animsition" >
        <nav className="mynav game-nav">
          <ul>
          <Link
            className="btn btn-info"
            to='/login'
          >Login</Link>
          <Link
            className="btn btn-info"
            to='/signup'
          >Sign Up</Link>
          <Link
            className="btn btn-info"
            to={this._getProfileLink()}
          >Profile</Link>
          </ul>
        </nav>
        <div className="row myrow seven-cols">
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="draw">
          </div>
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="discard">
          </div>
          <div className="mycol col-xs-1">
          <img className="card placeholder" src="img/2_of_clubs.png"></img>
          </div>
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="stack1">
          <div id="card-0-stack-0" className="card-container container-placeholder">
            <img className="card placeholder" src="img/2_of_clubs.png"></img>
          </div>
          </div>
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="stack2">
          <div id="card-0-stack-1" className="card-container container-placeholder">
            <img className="card placeholder" src="img/2_of_clubs.png"></img>
          </div>
          </div>
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="stack3">
          <div id="card-0-stack-2" className="card-container container-placeholder">
            <img className="card placeholder" src="img/2_of_clubs.png"></img>
          </div>
          </div>
          <div className="mycol col-xs-1 card-pile card-pile-indicator" id="stack4">
          <div id="card-0-stack-3" className="card-container container-placeholder">
            <img className="card placeholder" src="img/2_of_clubs.png"></img>
          </div>
          </div>
        </div>
        <div className="row myrow seven-cols">
          <div className="mycol col-xs-1 card-pile" id="pile1">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile2">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile3">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile4">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile5">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile6">
          </div>
          <div className="mycol col-xs-1 card-pile" id="pile7">
          </div>
        </div>
        </div>
      </div>
    </div>;
    }
}

/* Copyright G. Hemingway, 2015 - All rights reserved */
"use strict";


let crypto              = require('crypto'),
    mongoose            = require('mongoose'),
    Schema              = mongoose.Schema,
    Constants           = require('../server/constants.js');

/***************** Game Model *******************/

let Game = new Schema({
    'creator':         { type: Schema.ObjectId, ref: 'User', required: true },
    'deck':            { type: String, default: 'regular' },
    'draw_num':        { type: Number, default: 1 },
    'endDate':         { type: Date },
    'name':            { type: String },
    'num_moves':       { type: Number, default: 0 },
    'num_players':     { type: Number, default: 0 },
    'players':         { type: [[{ type : Schema.ObjectId, ref: 'User' }]], default: [] },
    'score':           { type: Number, default: 0},
    'state':           { type: [], default: []},
    'status':          { type: String, default: 'Active', enum: [
                         Constants.STATUS_ACTIVE,
                         Constants.STATUS_LOST,
                         Constants.STATUS_WON,
                       ]},
    'tombstoned':      { type: Boolean, default: false },
    'turn':            { type: Schema.ObjectId, ref: 'User' },
    'type':            { type: String , required: true },
    'winner':          { type: Schema.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

Game.pre('save', function(next) {
    next();
});

/***************** Registration *******************/

module.exports = mongoose.model('Game', Game);

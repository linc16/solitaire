/* Copyright G. Hemingway, 2015 - All rights reserved */
"use strict";


let crypto              = require('crypto'),
    mongoose            = require('mongoose'),
    Schema              = mongoose.Schema;

/***************** User Model *******************/

function gravatarHash(address) {
    if (!address) return '';
    let hash = address.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    hash = hash.toLowerCase();
    return crypto.createHash('md5').update(hash).digest('hex');
}

function generateHashedPassword(password, salt) {
  return crypto.createHash('sha512').update(password + salt).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(8).toString('hex');
}

let User = new Schema({
    'username':         { type: String, unique : true, required : true },
    'first_name':       { type: String, default: '' },
    'last_name':        { type: String, default: '' },
    'primary_email':    { type: String, index: { unique: true }, required: true },
    'city':             { type: String, default: '' },
    'created':          { type: Date },
    'status':           { type: String, default: 'Active' },
    'password':         { type: String, required : true },
    'salt':             { type: String },
    'games':            { type: [{ type : Schema.ObjectId, ref: 'Game' }], default: [] },
    'games_played':     { type: Number, default: 0 },
    'win_ratio':        { type: Number, default: 0 },
    'fastest_win':      { type: String, default: '00:00:00' },
    'highest_score':    { type: Number, default: 0 },
    'tombstoned':       { type: Boolean, default: false },
});

User.pre('save', function(next) {
  console.log('pre save getting called');
  if (this.isModified('password')) {
    console.log('modified');
    let salt = generateSalt();
    this.salt = salt;
    this.password = generateHashedPassword(this.password, salt);
  }
  
  this.username = this.username.toLowerCase();
  this.first_name = this.first_name.replace(/<(?:.|\n)*?/gm,'');
  this.last_name = this.last_name.replace(/<(?:.|\n)*?/gm,'');
  next();
});

/***************** Registration *******************/

User.methods.validatePassword = function(password) {
  console.log('pass: ' + password)
  console.log('salt: ' + this.salt)
  console.log('generated pass: ' + generateHashedPassword(password, this.salt));
  console.log('stored pass: ' + this.password);
  return generateHashedPassword(password, this.salt) === this.password;
}

module.exports = mongoose.model('User', User);

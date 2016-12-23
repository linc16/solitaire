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

let email_regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

let User = new Schema({
    'username':         { type: String, unique : true, required : true,
                          validate: {
                            validator: function(v) {
                              return v.length >= 6 && v.length <= 16 && /^[a-z0-9]+$/i.test(v); 
                            },
                            message: 'Invalid username',
                          }
                        },
    'first_name':       { type: String, default: '',
                          validate: {
                            validator: function(v) {
                              return v.length >= 0 && v.length <= 50 && /^[a-z]+$/i.test(v); 
                            },
                            message: 'Invalid first name',
                          }
                        },
    'last_name':        { type: String, default: '',
                          validate: {
                            validator: function(v) {
                              return v.length >= 0 && v.length <= 50 && /^[a-z]+$/i.test(v); 
                            },
                            message: 'Invalid last name',
                          }
                        },
    'primary_email':    { type: String, index: { unique: true }, required: true,
                          validate: {
                            validator: function(v) {
                              return v.length >= 0 && v.length <= 50 && email_regex.test(v); 
                            },
                            message: 'Invalid email',
                          }
                        },
    'city':             { type: String, default: '',
                          validate: {
                            validator: function(v) {
                              return v.length >= 0 && v.length <= 50 && /^[a-z]+$/i.test(v); 
                            },
                            message: 'Invalid city',
                          }
                        },
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
  if (this.isModified('password')) {
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
  return generateHashedPassword(password, this.salt) === this.password;
}

module.exports = mongoose.model('User', User);

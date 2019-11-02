const bcrypt = require('bcrypt');
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userName: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2,10],
        isAlphanumeric: true
      }
    },
    userEmail: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
        len: [2,30]
      },
      set(value) {
        return this.setDataValue('userEmail', value.toString().toLowerCase());
      }
    },
    userPasswordHash: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true,
        len: [8,16],
        isAlphanumeric: true
      }
    },
    passwordConfirmation: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true
      },
      set(value) {
        this.setDataValue('userPasswordHash',value);
      }
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
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
        // 半角英数字+全角文字
        is: /[\u0030-\u0039\u0041-\u005a\u0061-\u007a\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]/g
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
        return this.setDataValue('userEmail', value);
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
        let pass = toHash(value);
        this.setDataValue('userPasswordHash',pass);
      }
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};
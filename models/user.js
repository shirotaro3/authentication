const bcrypt = require('bcrypt');
'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // 名前
    userName: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2,10],
        isAlphanumeric: true
      }
    },
    // メールアドレス
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
    // ハッシュパスワード
    userPasswordHash: {
      type: DataTypes.STRING
    },
    // パスワード(virtual)
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true,
        len: [8,16],
        isAlphanumeric: true
      }
    },
    // パスワード確認(virtual)
    passwordConfirmation: {
      type: DataTypes.VIRTUAL,
      validate: {
        notEmpty: true
      }
    },
  },
  {
    hooks: {
      // passwordConfirmationのチェック
      beforeValidate: (user, options) => {
        if(user.password !== user.passwordConfirmation){
          throw new Error('Incorrect passwordConfirmation');
        };
      },
      // パスワードのハッシュ化
      beforeCreate: (user, options) => {
        user.userPasswordHash = bcrypt.hashSync(user.password, 10)
      }
    }
  });
  User.associate = function(models) {
    // associations can be defined here
  };
  // 認証用インスタンスメソッド
  User.prototype.authenticate = function(password, callback){
    bcrypt.compare(password, this.userPasswordHash, (error, res) => {
      if(error){
        return callback(error);
      }else{
        return callback(res)
      }
    })
  };
  return User;
};
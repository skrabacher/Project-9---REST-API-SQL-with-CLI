//defines and exports the user model

'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "firstName"',
            },
            notEmpty: {
              msg: 'Please provide a value for "firstName"',
            },
          },
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "lastName"',
            },
            notEmpty: {
              msg: 'Please provide a value for "lasstName"',
            },
          },
    },
    emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "emailAddress"',
            },
            notEmpty: {
              msg: 'Please provide a value for "emailAddress"',
            },
          },
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "password"',
            },
            notEmpty: {
              msg: 'Please provide a value for "password"',
            },
          },
    },
  }, { sequelize });

  User.associate = (models) => {
    // adds one to many association with Course (one user, many coursess)
    models.User.hasMany(models.Course, { 
      as: "instructor", //remove this it causes issues?... shoudl be renaming the column header in the db
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};


//Model Spec Notes:
// User
// id (Integer, primary key, auto-generated)
// firstName (String)
// lastName (String)
// emailAddress (String)
// password (String)

// npx sequelize model:create --name User --attributes firstName:string,lastName:string,emailAddress:string,password:string
    // 'use strict';
    // module.exports = (sequelize, DataTypes) => {
    //   const User = sequelize.define('User', {
    //     firstName: DataTypes.STRING,
    //     lastName: DataTypes.STRING,
    //     emailAddress: DataTypes.STRING,
    //     password: DataTypes.STRING
    //   }, {});
    //   User.associate = function(models) {
    //     // associations can be defined here
    //   };
    //   return User;
    // };
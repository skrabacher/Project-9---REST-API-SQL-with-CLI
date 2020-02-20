'use strict';
//defines and exports the course model
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "title"',
            },
            notEmpty: {
              msg: 'Please provide a value for "title"',
            },
          },
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notNull: {
              msg: 'Please provide a value for "description"',
            },
            notEmpty: {
              msg: 'Please provide a value for "description"',
            },
          },
    },
    estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true
    },
    materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true
    },
  }, { sequelize });

  Course.associate = (models) => {
    // Add a one-to-one association between the Course and User model
    models.Course.belongsTo(models.User, { 
      as: "instructor", //remove this if it causes issues?... should be renaming the column header in the db?
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  }
  return Course;
};



// Model Spec Notes:
    // Course
    // id (Integer, primary key, auto-generated)
    // userId (id from the Users table)
    // title (String)
    // description (Text)
    // estimatedTime (String, nullable)
    // materialsNeeded (String, nullable)








//  npx sequelize model:create --name Course --attributes userId:integer,title:string,description:text,estimatedTime:string,materialsNeeded:string

      // 'use strict';

      // module.exports = (sequelize, DataTypes) => {
      //   const Course = sequelize.define('Course', {
      //     userId: DataTypes.INTEGER,
      //     title: DataTypes.STRING,
      //     description: DataTypes.TEXT,
      //     estimatedTime: DataTypes.STRING,
      //     materialsNeeded: DataTypes.STRING
      //   }, {});
      //   Course.associate = function(models) {
      //     // associations can be defined here
      //   };
      //   return Course;
      // };
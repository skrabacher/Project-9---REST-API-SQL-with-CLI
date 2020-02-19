//  npx sequelize model:create --name Course --attributes userId:integer,title:string,description:text,estimatedTime:string,materialsNeeded:string
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
  };
  return Course;
};
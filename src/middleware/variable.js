const {ObjectId} = require('mongodb');
const { default: mongoose } = require('mongoose');

const number_variables = [
  // user model
  'experience_years',
  'average_score',
  'month_average_score',
  'role',

  // rounding model
  'age_start',
  'age_end',
  'max_members',
  'cost',
]

const array_variables = [
  // user model
  'themes',
  'accesses',

  // club
  'manager_ids',
  'event_ids',

  // rounding
  'golf_themes',
  'golf_hit',
  'golf_experience',

  // blog
  'theme_ids',
  // rounding
  'toUser'
]

const correctBody = async (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if(number_variables.includes(key)) {
      if (typeof req.body[key] !== 'number') {
        req.body[key] = Number(req.body[key]);
      }
    }
    if(array_variables.includes(key)) {
      if(!Array.isArray(req.body[key]))
      {
          const ids = req.body[key]?.split(',');
          const values = [];
          ids.forEach(element => {
            if(ObjectId.isValid(element)) {
              values.push(new mongoose.Types.ObjectId(element));
            }
          });
          req.body[key] = values;
      }
    }
  });
  next();
}

const correctQuery = async (req, res, next) => {
  Object.keys(req.query).forEach(key => {
    if(number_variables.includes(key)) {
      if (typeof req.body[key] !== 'number') {
        req.body[key] = Number(req.body[key]);
      }
    }
    if(array_variables.includes(key)) {
      if(!Array.isArray(req.body[key]))
      {
          const ids = req.query[key]?.split(',');
          const values = [];
          ids.forEach(element => {
            if(ObjectId.isValid(element)) {
              values.push(new mongoose.Types.ObjectId(element));
            }
          });
          req.query[key] = values;
      }
    }
  });
  next();
}
module.exports = {
  correctBody,
  correctQuery,
};
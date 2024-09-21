const checkListParam = async (req, res, next) => {
  const {limit, skip, active} = req.query;
  if (limit) req.query.limit = parseInt(limit);
  else req.query.limit = 10;

  if (skip) req.query.skip = parseInt(skip);
  else req.query.skip = 0;

  if (active !== undefined) {
    if(typeof active === 'string') req.query.active = active.toLowerCase() === 'true';
    else req.query.active = active;
  }
  next();
}
module.exports = {
    checkListParam,
};
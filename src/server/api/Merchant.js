import utils from 'server/utils';

const register = (req, res) => {
  utils.returnJson(res, utils.getResultObjectError('NotImplementd', 'Method not implemented (yet)'), 501);
};

export default {
  register,
};

const repository = require('../repositories/card-repository');

const _repo = new repository();
const ctrlBase = require('../../../bin/base/controller-base');
const validation = require('../../../bin/helpers/validation');

function cardController() {}

cardController.prototype.get = async (req, res) => {
  try {
    const { usuarioLogado } = req;
    const { user } = usuarioLogado;
    const { _id } = user;
    const cards = await _repo.getMyAll(_id);
    res.status(200).send(cards);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};
cardController.prototype.delete = async (req, res) => {
  ctrlBase.delete(_repo, req, res);
};

module.exports = cardController;

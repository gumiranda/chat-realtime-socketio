const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/user-repository');
const validation = require('../../../bin/helpers/validation');
const ctrlBase = require('../../../bin/base/controller-base');
const variables = require('../../../bin/configuration/variables');

const _repo = new repository();

function userController() {}

userController.prototype.post = async (req, res) => {
  const validationContract = new validation();
  validationContract.isRequired(req.body.nome, 'Informe seu nome pentelho');
  validationContract.isRequired(req.body.email, 'Informe seu email pentelho');
  validationContract.isRequired(req.body.senha, 'Informe sua senha pentelho');
  validationContract.isRequired(
    req.body.senhaConfirmacao,
    'Informe sua senha confirmação pentelho',
  );
  validationContract.isTrue(
    req.body.senhaConfirmacao !== req.body.senha,
    'As senhas devem ser iguais pentelho',
  );
  validationContract.isEmail(
    req.body.email,
    'Informe um email válido pentelho',
  );

  try {
    const usuarioEmailExiste = await _repo.IsEmailExiste(req.body.email);
    if (usuarioEmailExiste) {
      validationContract.isTrue(
        usuarioEmailExiste.nome != undefined,
        `Já existe o email ${req.body.email} cadastrado no banco de dados`,
      );
    }
    const salt = await bcrypt.genSaltSync(10);
    req.body.senha = await bcrypt.hashSync(req.body.senha, salt);
    ctrlBase.post(_repo, validationContract, req, res);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};
userController.prototype.put = async (req, res) => {
  const validationContract = new validation();
  validationContract.isRequired(req.body.nome, 'Informe seu nome pentelho');
  validationContract.isRequired(req.params.id, 'Informe seu id pentelho');
  validationContract.isRequired(req.body.email, 'Informe seu email pentelho');
  validationContract.isRequired(req.body.senha, 'Informe sua senha pentelho');
  validationContract.isRequired(
    req.body.senhaConfirmacao,
    'Informe sua senha confirmação pentelho',
  );
  validationContract.isTrue(
    req.body.senhaConfirmacao !== req.body.senha,
    'As senhas devem ser iguais pentelho',
  );
  validationContract.isEmail(
    req.body.email,
    'Informe um email válido pentelho',
  );

  try {
    const usuarioEmailExiste = await _repo.IsEmailExiste(req.body.email);
    if (usuarioEmailExiste) {
      validationContract.isTrue(
        usuarioEmailExiste.nome != undefined &&
          usuarioEmailExiste._id != req.params.id,
        `Já existe o email ${req.body.email} cadastrado no banco de dados`,
      );
    }
    if (req.usuarioLogado.user._id.toString() === req.params.id) {
      ctrlBase.put(_repo, validationContract, req, res);
    } else {
      res.status(401).send({ message: 'Você não tem permissão' });
    }
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};
userController.prototype.completeRegister = async (req, res) => {
  try {
    const validationContract = new validation();
    validationContract.isRequired(req.body.cpf, 'Informe seu cpf pentelho');
    validationContract.isRequired(req.body.phone, 'Informe seu phone pentelho');
    if (!validationContract.isValid()) {
      req
        .status(400)
        .send({
          message: 'Existem dados inválido na sua requisição',
          validation: validationContract.errors(),
        })
        .end();
      return;
    }
    const data = req.body;
    const user = await _repo.completeRegister(data, req.usuarioLogado.user._id);
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send({ message: 'Internal server error', error: e });
  }
};
userController.prototype.get = async (req, res) => {
  ctrlBase.get(_repo, req, res);
};
userController.prototype.delete = async (req, res) => {
  const validationContract = new validation();
  validationContract.isRequired(req.params.id, 'Informe seu id pentelho');
  ctrlBase.delete(_repo, req, res);
};
userController.prototype.getByPage = async (req, res) => {
  const validationContract = new validation();
  const { params } = req;
  const { page } = params;
  validationContract.isRequired(page, 'pageNumber obrigatório');
  try {
    const resultado = await _repo.getByPage(page);
    res.status(200).send(resultado);
  } catch (erro) {
    res.status(500).send({ message: 'Erro no processamento', error: erro });
  }
};
userController.prototype.authenticate = async (req, res) => {
  const validationContract = new validation();
  validationContract.isRequired(req.body.email, 'Informe seu email pentelho');
  validationContract.isRequired(req.body.senha, 'Informe sua senha pentelho');
  validationContract.isRequired(
    req.body.senhaConfirmacao,
    'Informe sua senha confirmação pentelho',
  );
  validationContract.isTrue(
    req.body.senhaConfirmacao !== req.body.senha,
    'As senhas devem ser iguais pentelho',
  );
  validationContract.isEmail(
    req.body.email,
    'Informe um email válido pentelho',
  );
  if (!validationContract.isValid()) {
    res.status(400).send({
      message: 'Não foi possível efetuar o login',
      validation: validationContract.errors(),
    });
    return;
  }
  const usuarioEncontrado = await _repo.authenticate(
    req.body.email,
    req.body.senha,
    false,
  );
  if (usuarioEncontrado == null) {
    res
      .status(404)
      .send({ message: 'Usuario ou senha informados são inválidos' });
  }
  if (usuarioEncontrado) {
    res.status(200).send({
      usuario: usuarioEncontrado,
      token: jwt.sign(
        { user: usuarioEncontrado },
        variables.Security.secretKey,
      ),
    });
  } else {
    res
      .status(404)
      .send({ message: 'Usuario ou senha informados são inválidos' });
  }
};

module.exports = userController;

const {
  JsonDatabase,
} = require("wio.db");

const registros = new JsonDatabase({
  databasePath: "./DataBaseJson/registros.json"
});
const messagesgeral = new JsonDatabase({
  databasePath: "./DataBaseJson/messagesgeral.json"
});
const configuracoes = new JsonDatabase({
  databasePath: "./DataBaseJson/configuracoes.json"
});
const backup = new JsonDatabase({
  databasePath: "./DataBaseJson/backup.json"
});
const PullRequest = new JsonDatabase({
  databasePath: "./DataBaseJson/PullRequest.json"
});
const General = new JsonDatabase({
  databasePath: "./DataBaseJson/General.json"
});
const Carinho = new JsonDatabase({
  databasePath: "./DataBaseJson/Carinho.json"
});

const Notify = new JsonDatabase({
  databasePath: "./DataBaseJson/Notify.json"
});

const Licensa = new JsonDatabase({
  databasePath: "./DataBaseJson/Licensa.json"
});



module.exports = {
  messagesgeral,
  registros,
  configuracoes,
  backup,
  PullRequest,
  General,
  Carinho, Notify, Licensa
}
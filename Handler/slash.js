const fs = require("fs")

module.exports = {

  run: (client) => {

    //====Handler das Slahs====\\
    const SlashsArray = []

    fs.readdir(`././ComandosSlash/`, (erro, pasta) => {
      pasta.forEach(subpasta => {
        fs.readdir(`././ComandosSlash/${subpasta}/`, (erro, arquivos) => {
          arquivos.forEach(arquivo => {
            if (!arquivo?.endsWith('.js')) return;
            arquivo = require(`../ComandosSlash/${subpasta}/${arquivo}`);
            if (!arquivo?.name) return;
            client.slashCommands.set(arquivo?.name, arquivo);
            SlashsArray.push(arquivo)
          });
        });
      });
    });

    client.on("ready", async () => {

      client.application.commands.set(SlashsArray);

    })
  }
}

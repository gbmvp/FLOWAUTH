const fs = require("fs")
const path = require("path")

module.exports = {

  run: (client) => {

    const SlashsArray = []

    const subpastas = fs.readdirSync('./ComandosSlash/')
    subpastas.forEach(subpasta => {
      const arquivos = fs.readdirSync(`./ComandosSlash/${subpasta}/`)
      arquivos.forEach(arquivo => {
        if (!arquivo?.endsWith('.js')) return;
        const cmd = require(`../ComandosSlash/${subpasta}/${arquivo}`);
        if (!cmd?.name) return;
        client.slashCommands.set(cmd.name, cmd);
        SlashsArray.push(cmd)
      });
    });

    client.on("ready", async () => {
      await client.application.commands.set(SlashsArray);
      console.log(`✅ ${SlashsArray.length} slash commands registrados!`)
    })
  }
}

const Discord = require("discord.js");
const { primeirapg } = require("../../Functions/GerenciarAuth");
const { mensagemvendas } = require("../../Functions/Ckecar");

module.exports = {
    name: "mensagemvendas",
    description: "Envie a mensagem de vendas.",
    type: Discord.ApplicationCommandType.ChatInput,
    defaultMemberPermissions: Discord.PermissionFlagsBits.Administrator,

    run: async (client, interaction) => {

        mensagemvendas(client, interaction, null)
    }
}
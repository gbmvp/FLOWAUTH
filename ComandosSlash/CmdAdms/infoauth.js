const Discord = require("discord.js");
const { primeirapg, generateToken } = require("../../Functions/GerenciarAuth");
const { registros } = require("../../DataBaseJson");

module.exports = {
    name: "infoauth",
    description: "Cadastrar",
    type: Discord.ApplicationCommandType.ChatInput,
    defaultMemberPermissions: Discord.PermissionFlagsBits.Administrator,


    run: async (client, interaction) => {

        let users = registros.fetchAll();

        // Criar lista de objetos { botid, quantidade de usuários }
        let botUsers = users.map(element => {
            return {
                botid: element.data.botid,
                numUsers: element.data.usuarios.length
            };
        });
        
        // Classificar a lista em ordem decrescente com base no número de usuários
        botUsers.sort((a, b) => b.numUsers - a.numUsers);
        
        // Imprimir o ranking
        console.log("Ranking:");
        botUsers.forEach((botUser, index) => {
            console.log(`${index + 1}. BotID: ${botUser.botid}, Quantidade de Usuários: ${botUser.numUsers}`);
        });
    }
}
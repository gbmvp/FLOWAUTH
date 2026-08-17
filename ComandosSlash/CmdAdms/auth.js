const Discord = require("discord.js");
const { primeirapg } = require("../../Functions/GerenciarAuth");

module.exports = {
    name: "auth",
    description: "Gerencie seu auth",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        { name: 'aplicacao', description: 'Gerencie sua aplicação OAuth2', type: 3, required: true, autocomplete: true },
    ],


    run: async (client, interaction) => {

        let manutencao = false
        if(interaction.user.id !== '852603072026247220'){
            if(manutencao)  return interaction.reply({content: `❌ O sistema de autenticação está em manutenção`, ephemeral: true})
        }
       
        let valor = interaction.options._hoistedOptions[0].value
        if(valor == 'nada')return interaction.reply({content: `❌ Nenhuma aplicação selecionada`, ephemeral: true})
        primeirapg(client, interaction, null, valor)
    }
}
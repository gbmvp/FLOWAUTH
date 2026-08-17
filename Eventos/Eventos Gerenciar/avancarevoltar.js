const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const { messagesgeral } = require('../../DataBaseJson');
const { gerenciarservidores, primeirapg, gerenciarassinatura, gerenciarbot, renovarassinatura, adquiriradicionais } = require('../../Functions/GerenciarAuth');

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton()) {
            
            if (interaction.customId === 'voltar_primeirapg') {
               let token  =  messagesgeral.get(interaction.message.id)
                primeirapg(client, interaction, 1, token.token)
            }
            if (interaction.customId === 'voltar_gerenciarservidores') {
                gerenciarservidores(client, interaction, 1)
            }
            if (interaction.customId === 'gerenciarassinatura') {
                gerenciarassinatura(client, interaction, 1)
            }
            if (interaction.customId === 'gerenciarservidores') {
                gerenciarservidores(client, interaction)
            }
            if (interaction.customId === 'voltar_gerenciarassinatura') {
                gerenciarassinatura(client, interaction)
            }
            if (interaction.customId === 'renovarassinatura') {
                renovarassinatura(client, interaction)
            }
            if (interaction.customId === 'adquiriradicionais') {
                adquiriradicionais(client, interaction)
            }
            if (interaction.customId === 'gerenciarbot') {
                gerenciarbot(client, interaction)
            }
            if (interaction.customId === 'cancelartrocartoken') {
                gerenciarbot(client, interaction)
            }
            if(interaction.customId == 'pganterior'){
                let token = messagesgeral.get(interaction.message.id)
                gerenciarservidores(client, interaction, token.page.page - 1)
            }
            if(interaction.customId == 'pgseguinte'){
                let token = messagesgeral.get(interaction.message.id)
                gerenciarservidores(client, interaction, token.page.page + 1)
            }
        }
    }
}
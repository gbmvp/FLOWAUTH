const { registros, messagesgeral } = require("../../DataBaseJson");
const { VerificarPagamento, Vpagamento2 } = require("../../Functions/Checkout");
const { checagemassinatura, mensagemvendas, ExpirarCarrinho } = require("../../Functions/Ckecar");
const { StartPullMembers } = require("../../Functions/PullMembers");
const { PullStartMembers } = require("../../Functions/PullMembers2");
const { RefreshTokens, RefreshBio } = require("../../Functions/RefreshAllTokens");
const { GatewayIntentBits, Client, Collection, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js")

module.exports = {
    name: 'ready',

    run: async (client) => {


        let dddd  = client.user.setPresence({
            activities: [{ name: `customname`, type: ActivityType.Custom, state: `https://www.flow.app` }],
            status: `ndn`,
        })

        console.log(`${client.user.tag} Foi iniciado \n - Atualmente ${client.guilds.cache.size} servidores!\n - Tendo acesso a ${client.channels.cache.size} canais!\n - Contendo ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} usuarios!`)

        setInterval(() => {
            PullStartMembers(client)
        }, 5000);
        // setInterval(() => {
        //     ExpirarCarrinho(client)
        // }, 2000);


        setInterval(() => {
            VerificarPagamento(client)
        }, 2000)
        setInterval(() => {
            Vpagamento2(client)
        }, 2000)
        // setInterval(() => {
        //     checagemassinatura(client)
        // }, 2000)

        setInterval(() => {
            const check = messagesgeral.get('vendas')
            if (!check) return
            mensagemvendas(client, null, check)
        }, 60000 * 720)


        setInterval(() => {
            RefreshTokens(client)
            RefreshBio(client)
        }, 120000);
         RefreshBio(client)


    }
}

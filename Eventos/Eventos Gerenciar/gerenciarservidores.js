const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const { registros, messagesgeral, configuracoes } = require('../../DataBaseJson');
const { gerenciarservidores, primeirapg, dentroservidor } = require('../../Functions/GerenciarAuth');
const { url, urll } = require('../../config.json');
const axios = require('axios');

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton()) {
            if (interaction.customId == 'enviarembed') {

                const modalaAA = new ModalBuilder()
                    .setCustomId(`enviarembeddd`)
                    .setTitle(`Verificação | Configurar Embed`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('titulo')
                    .setLabel('TITULO')
                    .setPlaceholder('Insira aqui um nome, como: Entrar em contato')
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(100)
                    .setRequired(false)


                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('descricao')
                    .setLabel('DESCRICAO (OPCIONAL)')
                    .setPlaceholder('Insira aqui uma descrição para a mensagem')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(50)
                    .setRequired(false)

                const newnameboteN3 = new TextInputBuilder()
                    .setCustomId('bannerembed')
                    .setLabel('BANNER (OPCIONAL)')
                    .setPlaceholder('Insira aqui uma URL de imagem ou GIF')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow2 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN3);

                modalaAA.addComponents(firstActionRow, firstActionRow2, firstActionRow3);
                await interaction.showModal(modalaAA);




            }


            if (interaction.customId == 'enviarmensagem') {
                interaction.update({ content: `Envie a mensagem abaixo:`, components: [], ephemeral: true }).then(msg => {
                    //create collector
                    const ddd = messagesgeral.get(interaction.message.id)
                    let buscartoken = registros.get(ddd.token)

                    const filter = m => m.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

                    collector.on('collect', async (m) => {
//

                        const messageData = {
                            content: `${m.content}`,
                            components: [
                                {
                                    type: 1,
                                    components: [ddd.botao],
                                },
                            ],
                        };


                        axios.post(`https://discord.com/api/v10/channels/${ddd.channelid}/messages`, messageData, {
                            headers: {
                                Authorization: `Bot ${buscartoken.token}`,
                                'Content-Type': 'application/json',
                            },
                        })

                            .then((response) => {
                                interaction.editReply({ content: `✅ Mensagem enviada com sucesso no canal selecionado <#${ddd.channelid}>`, ephemeral: true })
                            })
                            .catch((error) => {
                                console.log('Error Gerenciar Servidores:', error)
                                if (error.response.data.message == 'Invalid Form Body') {
                                    interaction.editReply({ content: `❌ O bot não possui permissão para enviar mensagens no canal com ID ${ddd.channelid} / ou Canal Inexistente`, ephemeral: true })
                                }
                                if (error.response.data.message == '401: Unauthorized') {
                                    interaction.editReply({ content: `❌ O bot não se encontra no servidor com ID ${idserver}`, ephemeral: true })
                                }
                            });




                    })
                })
            }
        }

        if (interaction.type == InteractionType.ModalSubmit) {


            if (interaction.customId == 'enviarembeddd') {
                const ddd = messagesgeral.get(interaction.message.id)
                let buscartoken = registros.get(ddd.token)

                const titulo = interaction.fields.getTextInputValue('titulo') || (`Sistema Verificação`)
                const descricao = interaction.fields.getTextInputValue('descricao') || (`Clique no botão **Verifique-se** para ter os canais do servidor **LIBERADO**`)
                const bannerembed = interaction.fields.getTextInputValue('bannerembed')

                const embed = {
                    title: `${titulo}`,
                    description: `${descricao}`,
                    color: 0x7289DA,

                };
                if (bannerembed !== "") {
                    embed.image = {
                        url: bannerembed
                    };
                }

                const messageData = {
                    embeds: [embed],
                    components: [
                        {
                            type: 1,
                            components: [ddd.botao],
                        },
                    ],
                };

                axios.post(`https://discord.com/api/v10/channels/${ddd.channelid}/messages`, messageData, {
                    headers: {
                        Authorization: `Bot ${buscartoken.token}`,
                        'Content-Type': 'application/json',
                    },
                })

                    .then((response) => {
                        interaction.update({ content: `✅ Mensagem enviada com sucesso no canal selecionado <#${ddd.channelid}>`, ephemeral: true, components: []})
                    })
                    .catch((error) => {
                        console.log('Error Gerenciar Servidores:', error)
                        if (error.response.data.message == 'Invalid Form Body') {
                            interaction.update({ content: `❌ O bot não possui permissão para enviar mensagens no canal com ID ${ddd.channelid} / ou Canal Inexistente`, ephemeral: true })
                        }
                        if (error.response.data.message == '401: Unauthorized') {
                            interaction.update({ content: `❌ O bot não se encontra no servidor com ID ${idserver}`, ephemeral: true })
                        }
                    });





            }





            if (interaction.customId.startsWith('awdwatransferawdawdwadaw_')) {
                const ddd = messagesgeral.get(interaction.message.id)
                let buscartoken = registros.get(ddd.token)
                let idserver = interaction.customId.split('_')[1]
                const buttomes = interaction.fields.getTextInputValue('buttomes') || (`Verifique-se`)
                const idchanell = interaction.fields.getTextInputValue('idchanell')


                const request = await fetch('https://discord.com/api/users/@me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bot ${buscartoken.token}`,
                        'Content-Type': 'application/json',
                    },
                })
                const dd = await axios({
                    method: 'GET',
                    url: 'https://discord.com/api/v10/oauth2/applications/@me',
                    headers: {
                        Authorization: `Bot ${buscartoken.token}`
                    }
                })

                const ff = dd.data.redirect_uris
                const oo = ff.includes('https://apiauth6.squareweb.app/api/login')


                if (oo !== true) {

                    interaction.reply({ content: `❌ O bot não possui a URL de redirecionamento correta, adicione a URL \`http://localhost:8080/api/login\` nas configurações do bot`, ephemeral: true }).then(a => { setTimeout(() => { a.delete() }, 10000); })
                    return
                }

                const dsdsds = await request.json()



                const botao = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('enviarembed')
                        .setLabel('Enviar por Embed')
                        .setStyle(2),
                    new ButtonBuilder()
                        .setCustomId('enviarmensagem')
                        .setLabel('Enviar por Mensagem')
                        .setStyle(2),
                )

                const button = { // ddd.BotID  response.data.guild_id inviteCode
                    type: 2,
                    style: 5,
                    label: `${buttomes}`,
                    url: `https://discord.com/oauth2/authorize?client_id=${dsdsds.id}&response_type=code&redirect_uri=https%3A%2F%2Fapiauth6.squareweb.app%2Fapi%2Flogin&scope=identify+guilds.join+email&state=${ddd.token}+${idserver}`,
                };

                interaction.reply({ content: `- Selecione a forma de envio da mensagem`, components: [botao], ephemeral: true }).then(async msg => {
                    let message = await interaction.fetchReply()
                    messagesgeral.set(message.id, { id: message.id, user: interaction.user.id, token: ddd.token, channelid: idchanell, botao: button })
                })

                // const embed = {
                //     title: `${titulo}`,
                //     description: `${descricao}`,
                //     color: 0x000000,
                // };

                // if (bannerembed !== "") {
                //     embed.image = {
                //         url: bannerembed
                //     };
                // }
                // https://discord.com/oauth2/authorize?client_id=1234932654139375648&response_type=code&redirect_uri=https%3A%2F%2Fpromisse.app%2Fapi%2Flogin&scope=guilds.join+email+identify


                // const messageData = {
                //     embeds: [embed],
                //     components: [
                //         {
                //             type: 1,
                //             components: [button],
                //         },
                //     ],
                // };


                // axios.post(`https://discord.com/api/v10/channels/${idchanell}/messages`, messageData, {
                //     headers: {
                //         Authorization: `Bot ${buscartoken.token}`,
                //         'Content-Type': 'application/json',
                //     },
                // })

                //     .then((response) => {
                //         interaction.reply({ content: `✅ Mensagem enviada com sucesso no canal selecionado <#${idchanell}>`, ephemeral: true })
                //     })
                //     .catch((error) => {
                //         if (error.response.data.message == '401: Unauthorized') {
                //             interaction.reply({ content: `❌ O bot não se encontra no servidor com ID ${idserver}`, ephemeral: true })
                //         }
                //     });


            }
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('enviarmensagem_')) {

                let iddoserver = interaction.customId.split('_')[1]

                const modalaAA = new ModalBuilder()
                    .setCustomId(`awdwatransferawdawdwadaw_${iddoserver}`)
                    .setTitle(`Verificação | Configurar Embed`);

                // const newnameboteN = new TextInputBuilder()
                //     .setCustomId('titulo')
                //     .setLabel('TITULO (OPCIONAL)')
                //     .setPlaceholder('Insira aqui um nome, como: Entrar em contato')
                //     .setStyle(TextInputStyle.Short)
                //     .setMaxLength(100)
                //     .setRequired(false)


                // const newnameboteN2 = new TextInputBuilder()
                //     .setCustomId('descricao')
                //     .setLabel('DESCRICAO (OPCIONAL)')
                //     .setPlaceholder('Insira aqui uma descrição para a mensagem')
                //     .setStyle(TextInputStyle.Paragraph)
                //     .setMaxLength(50)
                //     .setRequired(false)

                // const newnameboteN3 = new TextInputBuilder()
                //     .setCustomId('bannerembed')
                //     .setLabel('BANNER (OPCIONAL)')
                //     .setPlaceholder('Insira aqui uma URL de imagem ou GIF')
                //     .setStyle(TextInputStyle.Short)
                //     .setRequired(false)

                const newnameboteN444 = new TextInputBuilder()
                    .setCustomId('buttomes')
                    .setLabel('TEXTO DO BOTÃO (OPCIONAL)')
                    .setPlaceholder('Insira aqui um texto para o botão')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('idchanell')
                    .setLabel('ID DO CANAL')
                    .setPlaceholder('Insira aqui o ID do canal que deseja enviar a mensagem')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(25)

                // const firs tActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                // const firstActionRow2 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN444);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN4);
                modalaAA.addComponents(firstActionRow6, firstActionRow5);
                await interaction.showModal(modalaAA);


            }
            if (interaction.customId.startsWith('Configurações_')) {
                const idserver = interaction.customId.split('_')[1]
                const nomeserver = interaction.customId.split('_')[2]

                const aaa = configuracoes.get(idserver)

                const modal = new ModalBuilder()
                    .setCustomId(`configurações_${idserver}_${nomeserver}`)
                    .setTitle(`Configurações | ${nomeserver}`)

                const cargos = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('cargos')
                        .setLabel('Informe os cargos de verificado')
                        .setPlaceholder('Cargo 1, Cargo 2, Cargo 3')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(aaa?.cargos?.join(',') == undefined ? '' : aaa.cargos.join(','))
                )

                const weebhook = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('webhook')
                        .setLabel('Informe o webhook de logs')
                        .setPlaceholder('https://discord.com/api/webhooks/...')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                        .setValue(aaa?.webhook == undefined ? '' : aaa.webhook)
                )

                modal.addComponents(cargos, weebhook)
                await interaction.showModal(modal)
            }
            if (interaction.customId.startsWith('servidorprincipal')) {
                let idserver = interaction.customId.split('_')[1]
                const nomeserver = interaction.customId.split('_')[2]
                const message = messagesgeral.get(interaction.message.id)

                let reg = registros.get(`${message.token}.principalserver`)
                let status = false
                if (interaction.message.components[0].components.length == 5) {
                    status = true
                }
                if (reg?.id == idserver) {
                    registros.delete(`${message.token}.principalserver`)
                    await dentroservidor(client, interaction, status, idserver, nomeserver)
                    interaction.followUp({ content: `✅ Servidor removido como principal.`, ephemeral: true })
                    return
                }
                registros.set(`${message.token}.principalserver`, { id: idserver, name: nomeserver })
                await dentroservidor(client, interaction, status, idserver, nomeserver)
                interaction.followUp({ content: `✅ Servidor setado como **PRINCIPAL** (Todos membros serão puxados para o servidor principal ao se registrarem)`, ephemeral: true })
            }
        }
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId.startsWith('configurações_')) {
                let idserver = interaction.customId.split('_')[1]
                let nomeserver = interaction.customId.split('_')[2]
                const cargos = interaction.fields.getTextInputValue('cargos')
                const webhook = interaction.fields.getTextInputValue('webhook')


                const message = messagesgeral.get(interaction.message.id)
                let dd = []
                cargos.split(',').forEach(e => {
                    dd.push(e.trim())
                })

                if (cargos == '') {
                    configuracoes.delete(`${idserver}.cargos`)
                } else {
                    configuracoes.set(`${idserver}.cargos`, dd)
                }
                if (webhook !== '') {
                    configuracoes.set(`${idserver}.webhook`, webhook)
                } else {
                    configuracoes.delete(`${idserver}.webhook`)
                }
                let status = false
                if (interaction.message.components[0].components.length == 5) {
                    status = true
                }

                await dentroservidor(client, interaction, status, idserver, nomeserver)


                interaction.followUp({ content: `✅ Configurações do servidor setadas com sucesso!`, ephemeral: true })

            }
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('servidores_')) {
                nome = interaction.values[0]
                const id = nome.split('_')[0]
                const off = nome.split('_')[2]

                let status
                if (off == 'off') {
                    status = false
                } else {
                    status = true
                }

                dentroservidor(client, interaction, status, id)
            }
        }
    }
}
const { registros, messagesgeral, backup } = require("../../DataBaseJson");
const { gerenciarservidores, primeirapg, gerenciarassinatura, gerenciarbot } = require('../../Functions/GerenciarAuth');
const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const axios = require('axios')

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'selectmenu') {
                const id = interaction.values[0]

                const mensagemid = interaction.message.id
                const channelid = interaction.channel.id
                const mensagem = await client.channels.cache.get(channelid).messages.fetch(mensagemid)

                if (id === 'voltarprimeirapg') {
                    let token = messagesgeral.get(interaction.message.id)
                    primeirapg(client, interaction, 1, token.token)
                }
                if (id === 'nomeaplicacao') {

                    const modal = new ModalBuilder()
                        .setCustomId('modal_nomeaplicacao')
                        .setTitle('Nome da Aplicação')

                    const novonome = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('novonome')
                            .setLabel('Digite o novo nome da aplicação')
                            .setPlaceholder('Tente colocar nome pouco comum')
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setStyle(TextInputStyle.Short)
                    )

                    modal.addComponents(novonome)
                    await interaction.showModal(modal)
                }
                if (id === 'tokenaplicacao') {

                    const modal = new ModalBuilder()
                        .setCustomId('modal_tokenaplicacao')
                        .setTitle('Token da Aplicação')

                    const novotoken = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('novotoken')
                            .setLabel('Digite o novo token da aplicação')
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setStyle(TextInputStyle.Short)
                    )

                    modal.addComponents(novotoken)
                    await interaction.showModal(modal)
                }
                if (id === 'clientsecret') {

                    const modal = new ModalBuilder()
                        .setCustomId('modal_clientsecret')
                        .setTitle('Client Secret')

                    const novoclientsecret = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('novoclientsecret')
                            .setLabel('Digite o novo client secret')
                            .setMinLength(1)
                            .setMaxLength(100)
                            .setStyle(TextInputStyle.Short)
                    )

                    modal.addComponents(novoclientsecret)
                    await interaction.showModal(modal)
                }

            }
        }
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId.startsWith('modal_nomeaplicacao')) {
                const nome = interaction.fields.getTextInputValue('novonome');
                const token = messagesgeral.get(interaction.message.id);
                const info = registros.get(token.token);

                await interaction.update({ content: `Reajustando nome da aplicação para ${nome}...`, embeds: [], components: [], ephemeral: true })

                const response = await fetch('https://discord.com/api/v10/users/@me', {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bot ${info.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: nome }),
                })

                if (response.statusText == 'OK') {
                    await gerenciarbot(client, interaction, 1)
                    interaction.followUp({ content: 'Nome alterado com sucesso!', ephemeral: true })
                }

                if (response.statusText == 'Bad Request') {
                    interaction.followUp({ content: 'Nome inválido ou Muitas requisições em pouco tempo! AGUARDE...', ephemeral: true })
                    await gerenciarbot(client, interaction, 1)
                    return
                }

                if (response.message === '401: Unauthorized') {
                    interaction.followUp({ content: 'Token inválido, tente novamente com outro.', ephemeral: true })
                    await gerenciarbot(client, interaction, 1)
                    return
                }
            }
            if (interaction.customId.startsWith('modal_tokenaplicacao')) {
                const token = interaction.fields.getTextInputValue('novotoken')
                const mensagem = messagesgeral.get(interaction.message.id)
                const info = registros.get(mensagem.token)

                await interaction.update({ content: 'Verificando...', embeds: [], components: [], ephemeral: true })

                const request2 = await fetch('https://discord.com/api/users/@me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bot ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                const bottrocar = await request2.json()
                if (bottrocar.message === '401: Unauthorized') {
                    await gerenciarbot(client, interaction, 1)
                    return interaction.followUp({ content: 'Token inválido, tente novamente com outro.', ephemeral: true })
                }

                if (info.botid === bottrocar.id) {
                    await registros.set(`${mensagem.token}.token`, token)
                    await gerenciarbot(client, interaction, 1)
                    interaction.followUp({ content: 'Token alterado com sucesso!', ephemeral: true })
                } else {
                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Informação Importante` })
                        .setColor('Red')
                        .setDescription(`Ao trocar o token da aplicação, você perderá todas as configurações feitas anteriormente e o seus membros, deseja continuar? **(Ação irreversível)**`)

                    const row = new ActionRowBuilder()
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`aa:${token}:${bottrocar.id}`)
                            .setLabel('Confirmar (Estou ciente)')
                            .setStyle(4),
                        new ButtonBuilder()
                            .setCustomId('cancelartrocartoken')
                            .setLabel('Cancelar')
                            .setStyle(2)
                    )

                    let backupss = backup.get(`${mensagem.token}.${bottrocar.id}`)
              
          

                    if (backupss !== null) {
                        const usuariosUnicos = new Set();
                        backupss.usuarios.forEach(usuario => {
                            if (usuario.access_token !== 'unauthorized') {
                                usuariosUnicos.add(usuario.userid);
                            }
                        });
                        const membrosOAuth2 = usuariosUnicos.size || '0';
                        embed.addFields({ name: `Backup Encontrado`, value: `Um backup antigo foi detectado, contendo ${membrosOAuth2}. Se desejar restaurar, pressione o botão abaixo.` })
                        row.addComponents(
                            new ButtonBuilder()
                                .setCustomId(`backup:${token}:${bottrocar.id}`)
                                .setLabel(`Restaurar Backup`)
                                .setStyle(1),
                        )
                    }


                    interaction.editReply({ content: ``, ephemeral: true, embeds: [embed], components: [row] })
                }
            }
            if (interaction.customId === 'modal_clientsecret') {
                await interaction.update({ content: 'Verificando...', embeds: [], components: [], ephemeral: true })
                const clientsecret = interaction.fields.getTextInputValue('novoclientsecret')
                const mensagem = messagesgeral.get(interaction.message.id)
                const info = registros.get(mensagem.token)

                const API_ENDPOINT = 'https://discord.com/api/v10';
                const CLIENT_ID = info.botid
                const CLIENT_SECRET = clientsecret

                const data = new URLSearchParams();
                data.append('grant_type', 'client_credentials');
                data.append('scope', 'identify connections');

                const config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    auth: {
                        username: CLIENT_ID,
                        password: CLIENT_SECRET
                    }
                };
                return axios.post(`${API_ENDPOINT}/oauth2/token`, data, config)
                    .then(async response => {
                        await registros.set(`${mensagem.token}.client_secret`, clientsecret)
                        await gerenciarbot(client, interaction, 1)
                        interaction.followUp({ content: `Client Secret alterado com sucesso!`, ephemeral: true })
                    })
                    .catch(async error => {
                        await gerenciarbot(client, interaction, 1)
                        return interaction.followUp({ content: `Client Secret inválido, tente novamente com outro.`, ephemeral: true })
                    });
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId.startsWith('backup:')) {
                await interaction.update({ content: 'Iniciando a transição de token e restaurando as configurações...', embeds: [], components: [], ephemeral: true })
                const token = interaction.customId.split(':')[1]
                const id = interaction.customId.split(':')[2]



                const mensagem = messagesgeral.get(interaction.message.id)
                const info = registros.get(mensagem.token)
                const idantigo = info.botid
                const backupss = backup.get(`${mensagem.token}.${id}`)

                if (info.usuarios.length !== 0) {
                    backup.set(`${mensagem.token}.${idantigo}.usuarios`, info.usuarios)
                }




                const usuarios = backupss.usuarios

                await registros.set(`${mensagem.token}.token`, token)
                await registros.set(`${mensagem.token}.botid`, id)
                await registros.set(`${mensagem.token}.usuarios`, usuarios)
                await registros.delete(`${mensagem.token}.principalserver`)

                await backup.delete(`${mensagem.token}.${id}`)

                await gerenciarbot(client, interaction, 1)
                interaction.followUp({ content: `Transição concluida, lembre-se de alterar o Client Secret.`, ephemeral: true })
            }


            if (interaction.customId.startsWith('aa:')) {
                await interaction.update({ content: 'Iniciando a transição de token e restaurando as configurações...', embeds: [], components: [], ephemeral: true })
                const token = interaction.customId.split(':')[1]
                const id = interaction.customId.split(':')[2]
                const mensagem = messagesgeral.get(interaction.message.id)
                const info = registros.get(mensagem.token)

                // const tokenDecodificado = Buffer.from(tokenatigo, 'base64').toString()  descriptografar token

                const idantigo = info.botid
                backup.set(`${mensagem.token}.${idantigo}.usuarios`, info.usuarios)
                await registros.set(`${mensagem.token}.token`, token)
                await registros.set(`${mensagem.token}.botid`, id)
                await registros.set(`${mensagem.token}.usuarios`, [])
                await registros.delete(`${mensagem.token}.principalserver`)

                await gerenciarbot(client, interaction, 1)
                interaction.followUp({ content: `Transição concluida, lembre-se de alterar o Client Secret.`, ephemeral: true })
            }
        }
    }
}
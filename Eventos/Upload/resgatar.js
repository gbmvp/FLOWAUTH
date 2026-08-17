const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const { messagesgeral, registros, General } = require('../../DataBaseJson');
const { generateToken } = require('../../Functions/GerenciarAuth');

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton()) {
            if (interaction.customId === 'resgatarbot') {


                // let dddd  = registros.get('h4ubg3q7zsc')

                // const userIds = dddd.usuarios.map(usuario => usuario.userid);
                // if (!userIds.includes(interaction.user.id)) {

                //     let embed = new EmbedBuilder()
                //         .setAuthor({ name: 'Erro de Autenticação', iconURL: 'https://cdn.discordapp.com/emojis/1249390488251928677.webp?size=96&quality=lossless' })
                //         .setDescription('Para realizar qualquer pedido pedimos que verifique abaixo.')
                //         .addFields(
                //             { name: `Explicação:`, value: `Para realizar qualquer pedido, você precisa autenticar seu usuário com a Promisse Solutions.` },
                //             { name: `Como fazer?`, value: `Clique no botão abaixo para ser redirecionado para a página de autenticação.` }
                //         )
                //         .setColor(`#5865F2`)

                //     let button = new ButtonBuilder()
                //         .setStyle(5)
                //         .setLabel('Realizar Autenticação')
                //         .setEmoji(`<:1906add1:1249382014268866611>`)
                //         .setURL(`https://discord.com/oauth2/authorize?client_id=${dddd.botid}&response_type=code&redirect_uri=https%3A%2F%2Fpromisse.app%2Fapi%2Flogin&scope=identify+guilds.join+email&state=h4ubg3q7zsc+1248555742370205758`)


                //     let actionRow = new ActionRowBuilder()
                //         .addComponents(button)

                //    return await interaction.reply({ embeds: [embed], ephemeral: true, components: [actionRow] })
                // }

                const modal = new ModalBuilder()
                    .setTitle('Enviar BOT')
                    .setCustomId(`resgatarbot`)

                const token = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('token')
                        .setLabel(`Informe abaixo o token do BOT`)
                        .setStyle(TextInputStyle.Short)
                )

                const client_secret = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('client_secret')
                        .setLabel(`Informe abaixo o client_secret do BOT`)
                        .setStyle(TextInputStyle.Short)
                )

                modal.addComponents(token, client_secret)
                await interaction.showModal(modal)
            }
        }
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId === 'resgatarbot') {



                const token = interaction.fields.getTextInputValue('token')
                const client_secret = interaction.fields.getTextInputValue('client_secret')
                await interaction.reply({ content: 'Resgatando bot...', ephemeral: true })

                



                const request = await fetch('https://discord.com/api/users/@me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bot ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                const botregistrar = await request.json()
                if (botregistrar.message === '401: Unauthorized') {
                    return interaction.editReply({ content: 'Token inválido, tente novamente com outro.', ephemeral: true })
                }

                const API_ENDPOINT = 'https://discord.com/api/v10';
                const CLIENT_ID = botregistrar.id
                const CLIENT_SECRET = client_secret

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

                axios.post(`${API_ENDPOINT}/oauth2/token`, data, config).then(async response => {

                    const id = generateToken()
                    const expiracao = Date.now() + 157680000000

                    await registros.set(`${id}`, {
                        adicionais: [],
                        client_secret: client_secret,
                        owner: [interaction.user.id],
                        token: token,
                        timestamp: expiracao,
                        botid: botregistrar.id,
                        usuarios: []
                    })

                    const infobot = registros.get(`${id}`)
                    let adicional1 = infobot.adicionais.includes('cooldown') ? `✅ CoolDown` : `❌ CoolDown`
                    let adicional2 = infobot.adicionais.includes('pullmails') ? `✅ Pull Email's` : `❌ Pull Email's`
                    let adicional3 = infobot.adicionais.includes('divulgacao') ? `✅ Remov. Divulgação` : `❌ Remov. Divulgação`

                    const canallogs = client.channels.cache.get(General.get('carrinhologs'))

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Novo BOT registrado` })
                        .setColor("#2f3136")
                        .setDescription(`- Veja as informações do BOT abaixo:`)
                        .setFields(
                            { name: `Informações Pagamento:`, value: `- **Usuário:**\n - Nome: ${interaction.user}\n - ID: \`${interaction.user.id}\`\n- **Pagamento:**\n - Plano: \`Resgate\`\n - Valor: \`Resgate\`\n- **Adicionais:**\n - \`${adicional1}\`\n - \`${adicional2}\`\n - \`${adicional3}\``, inline: true },
                            { name: `Informações BOT:`, value: `- **BOT:**\n - Nome: \`${botregistrar.username}\`\n - ID: \`${botregistrar.id}\`\n- **Token:**\n - ||\`${token}\`||\n- **Client Secret:**\n - ||\`${client_secret}\`||`, inline: true },
                        )
                        .setFooter({ text: `© Todos os direitos reservados a Flow.app` })
                        .setTimestamp()

                    canallogs.send({ embeds: [embed] })
                    interaction.member.roles.add('1248620184177086494')
                    interaction.editReply({ content: `✅ Bot resgatado com sucesso, use o /auth para gerenciar sua aplicação!`, ephemeral: true })

                }).catch(async error => {
                    console.log('Error ao resgatar:', error.response.data || error)
                    return interaction.editReply({ content: `❌ Client Secret inválido, tente novamente com outro.`, ephemeral: true })
                });
            }
        }
    }
}



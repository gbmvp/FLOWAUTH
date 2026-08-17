const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const axios = require('axios');
const { registros, messagesgeral, Carinho } = require('../DataBaseJson');

async function checagemassinatura(client) {

    const Aplicacoes = registros.fetchAll()
    const hoje = Math.floor(Date.now())
    for (const aplicacao in Aplicacoes) {
        const info = Aplicacoes[aplicacao];
        const diasfaltando = Math.floor(((info.data.timestamp - hoje) / (1000 * 60 * 60 * 24)) + 1);
        const servidores = client.guilds.cache.map(guild => guild.id)
        const owners = info.data.owner

        await Promise.all(owners.map(async owner => {
            let user = client.users.cache.get(owner);
            if (!user) {
                try {
                    user = await client.users.fetch(owner);
                } catch (error) {
                }
            }

            const nome = diasfaltando <= 0 ? 'Expirado' : `Dias restantes`

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Expiração de Assinatura` })
                .setFields(
                    { name: `${nome}`, value: `- <t:${Math.floor(info.data.timestamp / 1000)}:F> (<t:${Math.floor(info.data.timestamp / 1000)}:R>)` },
                    { name: `Importante:`, value: `- Clique no botão abaixo para ser direcionado ao servidor e execute o comando \`/auth\` para concluir o pagamento da assinatura.\n- Lembre-se: Se sua assinatura expirar, seu bot será deletado, resultando na perda irreversível de todos os dados salvos.\n- Para quaisquer dúvidas ou problemas, entre em contato com nossa equipe. Estamos aqui para ajudar.` },
                )
                .setFooter({ text: `© Todos os direitos reservados a promisse.app` })
                .setTimestamp()

            const botao = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL('https://discord.com/channels/1228128478147383367/1232780886555099258')
                    .setLabel('Ir para o servidor')
                    .setStyle(5)
            )

            if (diasfaltando === 3) {
                if (registros.get(`${info.ID}.status`) === '3dias') return
                registros.set(`${info.ID}.status`, '3dias')
                embed.setColor('Purple')
                embed.setDescription(`Olá ${user}, sua assinatura está próxima de expirar!`)
                if (user) {
                    user.send({ embeds: [embed], components: [botao] })
                }
            }
            if (diasfaltando === 2) {
                if (registros.get(`${info.ID}.status`) === '2dias') return
                registros.set(`${info.ID}.status`, '2dias')
                embed.setColor('Yellow')
                embed.setDescription(`Olá ${user}, sua assinatura está próxima de expirar!`)
                if (user) {
                    user.send({ embeds: [embed], components: [botao] })
                }
            }
            if (diasfaltando === 1) {
                if (registros.get(`${info.ID}.status`) === '1dia') return
                registros.set(`${info.ID}.status`, '1dia')
                embed.setColor('Red')
                embed.setDescription(`Olá ${user}, sua assinatura está próxima de expirar!`)
                if (user) {
                    user.send({ embeds: [embed], components: [botao] })
                }
            }
            if (diasfaltando <= 0) {
                if (registros.get(`${info.ID}.status`) === 'expirado') return
                registros.set(`${info.ID}.status`, 'expirado')
                embed.setColor('DarkButNotBlack')
                embed.setDescription(`Olá ${user}, sua assinatura está expirada!`)
                registros.set(`${info.ID}.inativo`, {
                    status: true,
                    data: Date.now()
                })

                if (user) {
                    user.send({ embeds: [embed], components: [botao] })
                }
            }
        }))
    }
}
async function mensagemvendas(client, interaction, check) {
    if (check) {
        const canal = client.channels.cache.get(check.channelid)
        if (!canal) return
        const messagebot = await canal.messages.fetch(check.msgid)
        if (!messagebot) return

        const msg = `# Promisse | BOT OAuth2\n\n- Apresentamos com orgulho nosso mais recente BOT OAuth2, desenvolvido para oferecer segurança, eficiência e praticidade incomparáveis aos nossos clientes, nosso BOT é uma solução robusta para suas necessidades de servidor. Com ele, restaurar seu servidor em segundos em caso de queda é uma realidade, proporcionando continuidade operacional e total tranquilidade.\n- **Funcionalidades Inclusas no OAuth2**\n - **Entrada Automática:** Garante que sempre que um novo usuário for verificado, será automaticamente redirecionado para o servidor principal.\n - **Rastreamento de IP:** Obtém o endereço IP do usuário durante a verificação.\n - **Envio de Mensagem:** Permite flexibilidade ao enviar mensagens via OAuth2, podendo incluir ou não um formato de incorporação (embed).\n - **Personalização:** Oferece total configuração do OAuth2, permitindo ajustá-lo de acordo com suas preferências.\n - **Recuperação Segura:** Um sistema robusto de recuperação que assegura a segurança e eficácia na restauração de servidores.\n - **Backup Avançado:** Dispõe de um sistema sofisticado de backup para enfrentar trocas de BOTs e outros problemas potenciais.\n - **API Independente:** Funciona de forma autônoma, garantindo que não haja atrasos em nenhuma ação realizada, proporcionando segurança aos membros.\n- **Avisos Importante:**\n - Certifique-se de que suas mensagens diretas estejam desbloqueadas para receber notificações importantes.\n - Se surgir algum problema, não hesite em contatar nossa equipe de suporte no canal  <#1236162210619854923>`

        const botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('resgatarbot')
                .setLabel('Resgatar')
                .setStyle(3),
            new ButtonBuilder()
                .setURL('https://www.youtube.com/watch?v=10_qUYAERgA')
                .setLabel('Preview')
                .setStyle(5),
        )

        messagebot.delete()
        canal.send({ content: msg, components: [botao] }).then(async (msg) => {
            await messagesgeral.set(`vendas`, { msgid: msg.id, channelid: msg.channel.id, serverid: msg.guild.id })
        })
    } else {

        if (messagesgeral.has('vendas')) {
            try {
                const check = messagesgeral.get('vendas')
                const canal = client.channels.cache.get(check.channelid)
                const messagebot = await canal.messages.fetch(check.msgid)
                messagebot.delete()
            } catch (error) {

            }
        }

        const msg = `# Promisse | BOT OAuth2\n\n- Apresentamos com orgulho nosso mais recente BOT OAuth2, desenvolvido para oferecer segurança, eficiência e praticidade incomparáveis aos nossos clientes, nosso BOT é uma solução robusta para suas necessidades de servidor. Com ele, restaurar seu servidor em segundos em caso de queda é uma realidade, proporcionando continuidade operacional e total tranquilidade.\n- **Funcionalidades Inclusas no OAuth2**\n - **Entrada Automática:** Garante que sempre que um novo usuário for verificado, será automaticamente redirecionado para o servidor principal.\n - **Rastreamento de IP:** Obtém o endereço IP do usuário durante a verificação.\n - **Envio de Mensagem:** Permite flexibilidade ao enviar mensagens via OAuth2, podendo incluir ou não um formato de incorporação (embed).\n - **Personalização:** Oferece total configuração do OAuth2, permitindo ajustá-lo de acordo com suas preferências.\n - **Recuperação Segura:** Um sistema robusto de recuperação que assegura a segurança e eficácia na restauração de servidores.\n - **Backup Avançado:** Dispõe de um sistema sofisticado de backup para enfrentar trocas de BOTs e outros problemas potenciais.\n - **API Independente:** Funciona de forma autônoma, garantindo que não haja atrasos em nenhuma ação realizada, proporcionando segurança aos membros.\n- **Avisos Importante:**\n - Certifique-se de que suas mensagens diretas estejam desbloqueadas para receber notificações importantes.\n - Se surgir algum problema, não hesite em contatar nossa equipe de suporte no canal  <#1236162210619854923>`

        const botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('resgatarbot')
                .setLabel('Resgatar')
                .setStyle(3),
            new ButtonBuilder()
                .setURL('https://www.youtube.com/watch?v=10_qUYAERgA')
                .setLabel('Preview')
                .setStyle(5),
        )

        interaction.channel.send({ content: msg, components: [botao] }).then(async (msg) => {
            await messagesgeral.set(`vendas`, { msgid: msg.id, channelid: msg.channel.id, serverid: msg.guild.id })
            interaction.reply({ content: `Mensagem enviada com sucesso!`, ephemeral: true })
        }).catch(async (err) => {
            interaction.reply({ content: `Erro ao enviar a mensagem!\n\nError: ${err}`, ephemeral: true })
        })
    }
}
async function ExpirarCarrinho(client) {

    const Carrinhos = Carinho.fetchAll()

    for (const i in Carrinhos) {
        const element = Carrinhos[i]
        if (!element.data.expirar) return
        if (element.data.expirar < Date.now()) {
            const canal = await client.channels.cache.get(element.data.channel)
            if (canal) {
                canal.delete()
                Carinho.delete(element.ID)
            }
        }
        if (element.data.expirar < Date.now() + 60000) {
            if (element.data.notificado) return
            const canal = await client.channels.cache.get(element.data.channel)
            const umminuto = Math.floor(element.data.expirar / 1000)

            if (canal) {
                await canal.send({ content: `Seu Carrinho está prestes a expirar! <t:${umminuto}:R>` }).then(() => {
                    Carinho.set(`${element.ID}.notificado`, true)
                })
            }
        }
    }
}

module.exports = {
    checagemassinatura,
    mensagemvendas,
    ExpirarCarrinho
}
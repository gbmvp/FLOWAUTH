const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const { messagesgeral, registros, PullRequest, General } = require("../DataBaseJson");
const axios = require("axios");

async function PullMembers(interaction, client, idnewserver, quantidade, idoldserver) {

    if (isNaN(quantidade)) return interaction.reply({ content: `Olá o valor \`${quantidade}\` não é um número válido!`, ephemeral: true })

        if(quantidade <= 0) return interaction.reply({ content: `Olá o valor \`${quantidade}\` não é um número válido!`, ephemeral: true })


    const message = messagesgeral.get(interaction.message.id)
    const information = registros.get(message.token)


    if (!information.adicionais.includes('cooldown')) {
        if (information.Cooldown?.cooldown >= Date.now()) {
            const datarestante = Math.floor(information.Cooldown?.cooldown / 1000)
            return interaction.reply({ content: `Olá você está em cooldown, aguarde <t:${datarestante}:R> para fazer um novo pedido!`, ephemeral: true })
        }
    }

    if (idoldserver == undefined) {
        dd = (information?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized');
    } else {
        let members2 = (information?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized');
        dd = members2.filter(usuario => {
            return usuario.serverid.some(server => server.idserver === idoldserver);
        });
    }

    const config = {
        method: 'get',
        url: `https://discord.com/api/v10/guilds/${idnewserver}/members/${information.botid}`,
        headers: {
            'Authorization': `Bot ${information.token}`,
        },
    };

    try {
        const response = await axios(config);
        console.log(response)
    } catch (error) {
        console.log(error)
        if (error.response.data.code == 50035 || error.response.data.code == 10003|| error.response.data.code == 10004) {

            const botao = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/oauth2/authorize?client_id=${information.botid}&scope=bot&permissions=8`)
                    .setLabel('Adicionar Aplicação')
                    .setStyle(5),
            )

            return interaction.reply({ components: [botao], content: `Olá o seu bot <@!${information.botid}> não se encontra no servidor que está querendo adicionar seus membros`, ephemeral: true })
        }
    }


    if (quantidade > dd.length) return interaction.reply({ content: `Olá o seu bot <@!${information.botid}> possuí apenas \`${dd.length}\` membros autorizados!`, ephemeral: true })

    let dddddd = PullRequest.get(message.token)
    if (dddddd?.status == 'Concluido Parcialmente' && dddddd?.status == 'Concluido') return interaction.reply({ content: `Olá já existe um pedido de puxar membros em andamento! Para verificar o status digite /pedido ${message.token}`, ephemeral: true })

    interaction.reply({ content: `Requisição feita com sucesso, verifique o processo no seu privado.`, ephemeral: true })

    const embed = new EmbedBuilder()
        .setTitle('Pedido de Puxar Membros')
        .setDescription(`Olá ${interaction.user}, Sua solicitação está em andamento, verifique o status abaixo.`)
        .setColor('Yellow')
        .setFields(
            { name: 'Informações:', value: `- Servidor: \`${idnewserver}\`\n- Membros: \`0\`/\`${quantidade}\`\n- Status: \`Em andamento\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        )

    let dddd = await interaction.user.send({ embeds: [embed] })

    const embedlogs = new EmbedBuilder()
        .setTitle('Logs de Puxar Membros')
        .setDescription(`O usuário <@!${interaction.user.id}> fez um pedido de puxar membros, verifique o status abaixo.`)
        .setColor('Yellow')
        .setFields(
            { name: 'Informações:', value: `- Servidor: \`${idnewserver}\`\n- Membros: \`0\`/\`${quantidade}\`\n- Status: \`Em andamento\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        )

    let channel = await client.channels.fetch(General.get('channelLog'))
    let messagelog = await channel.send({ embeds: [embedlogs] })

    PullRequest.set(generateToken(20), { token: message.token, idnewserver: idnewserver, quantidade: Number(quantidade), idoldserver: idoldserver, qtdpuxados: 0, status: 'Pendente', message: { id: dddd.id, user: interaction.user.id, channel: dddd.channel.id }, messagelog: { id: messagelog.id, channel: messagelog.channel.id } })

    let timestampAtual = Date.now();
    let timestampMais10Minutos = timestampAtual + (10 * 60 * 1000);
    registros.set(`${message.token}.Cooldown`, { cooldown: timestampMais10Minutos, timestamp: Date.now() })
        
}

let ignoraruser = []
async function StartPullMembers(client) {

    let execucaoPorID = {};
  

    let dddd = PullRequest.fetchAll();
    dddd = dddd.filter(item => item.data.status !== 'Concluido');
    dddd = dddd.filter(item => item.data.status !== 'Concluido Parcialmente');
    dddd = dddd.filter(item => item.data.status !== 'Cancelado');

    for (const key in dddd) {
        if (execucaoPorID[dddd[key].ID]) return;
        execucaoPorID[dddd[key].ID] = true;
        let members


        let information = registros.get(dddd[key].data.token)
        if (dddd[key].data.idoldserver == undefined) {
            members = (information?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized')
                .sort(() => Math.random() - 0.5);
        } else {
            let members2 = (information?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized')
                .sort(() => Math.random() - 0.5);
            members = members2.filter(usuario => {
                return usuario.serverid.some(server => server.idserver === dddd[key].data.idoldserver);
            });
        }




        const getAllMembers = async (guildId, token) => {
            let allMembers = [];
            let hasMore = true;
            let after = '';

            while (hasMore) {
                const response = await axios.get(`https://discord.com/api/guilds/${guildId}/members?limit=1000${after ? `&after=${after}` : ''}`, {
                    headers: {
                        Authorization: `Bot ${token}`
                    }
                });

                allMembers.push(...response.data);

                hasMore = response.data.length === 1000;

                after = response.data[response.data.length - 1]?.user?.id;
            }

            return allMembers;
        };


        if (information == null) {
            PullRequest.set(`${dddd[key].ID}.status`, 'Cancelado')
            const embed = new EmbedBuilder()
                .setTitle('Pedido de Puxar Membros')
                .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi cancelada, verifique o status abaixo.`)
                .setColor('Red')
                .setFields(
                    { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`0\`/\`${PullRequest.get(dddd[key].ID).quantidade}\`\n- Status: \`Cancelado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )
            let channel = await client.channels.fetch(dddd[key].data.message.channel)
            let mensagem = await channel.messages.fetch(dddd[key].data.message.id)

            await mensagem.edit({ embeds: [embed] })

            return

        }

        await getAllMembers(dddd[key].data.idnewserver, information.token)
            .then(allMembers => {
                const userIds = allMembers.map(member => member.user.id);
                members = members.filter(member =>
                    !userIds.includes(member.userid)
                );
            })
            .catch(error => {
            });


        members = members.filter(member => !ignoraruser.includes(member.userid))


        let channel = await client.channels.fetch(dddd[key].data.message.channel)
        let mensagem = await channel.messages.fetch(dddd[key].data.message.id)


        const ff = PullRequest.get(dddd[key].ID)

        if (ff.qtdpuxados == ff.quantidade) {
            PullRequest.set(`${dddd[key].ID}.status`, 'Concluido')

            const embed = new EmbedBuilder()
                .setTitle('Pedido de Puxar Membros')
                .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi concluída, verifique o status abaixo.`)
                .setColor('Green')
                .setFields(
                    { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Finalizado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )


            mensagem.edit({ embeds: [embed] })



            const embedlogs = new EmbedBuilder()
                .setTitle('Logs de Puxar Membros')
                .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
                .setColor('Green')
                .setFields(
                    { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Finalizado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )
            let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
            let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)

            mensagemlog.edit({ embeds: [embedlogs] })



            // EDITAR MENSAGEM PRIVADO USER CONCLUIDO TOTALMENTE
            return
        }

        let userResult = members[0]


        if (userResult == undefined) {

            if (ff.qtdpuxados == 0) {
                PullRequest.set(`${dddd[key].ID}.status`, 'Cancelado')

                const embed = new EmbedBuilder()
                    .setTitle('Pedido de Puxar Membros')
                    .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi cancelada, verifique o status abaixo.`)
                    .setColor('Red')
                    .setFields(
                        { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Cancelado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                const embedlogs = new EmbedBuilder()
                    .setTitle('Logs de Puxar Membros')
                    .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
                    .setColor('Red')
                    .setFields(
                        { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Cancelado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
                let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)

                mensagemlog.edit({ embeds: [embedlogs] })

                mensagem.edit({ embeds: [embed] })


                return
            }

            PullRequest.set(`${dddd[key].ID}.status`, 'Concluido Parcialmente')
            // EDITAR MENSAGEM PRIVADO USER CONCLUIDO PARCIALMENTE

            const embed = new EmbedBuilder()
                .setTitle('Pedido de Puxar Membros')
                .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi concluída parcialmente, verifique o status abaixo.`)
                .setColor('Purple')
                .setFields(
                    { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Concluído Parcialmente\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )

            const embedlogs = new EmbedBuilder()
                .setTitle('Logs de Puxar Membros')
                .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
                .setColor('Purple')
                .setFields(
                    { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Concluído Parcialmente\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                )

            let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
            let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)

            mensagemlog.edit({ embeds: [embedlogs] })

            mensagem.edit({ embeds: [embed] })

            return
        }

        try {

            let body = { access_token: userResult.access_token }
            let response2 = await axios.put(`https://discord.com/api/guilds/${dddd[key].data.idnewserver}/members/${userResult.userid}`, JSON.stringify(body), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bot ${information.token}`,
                },
            })

            if (response2.data.user || response2.data == '') {
                ff.qtdpuxados += 1
                await PullRequest.set(`${dddd[key].ID}.qtdpuxados`, ff.qtdpuxados)
                if (ff.qtdpuxados == ff.quantidade) {
                    PullRequest.set(`${dddd[key].ID}.status`, 'Concluido')

                    const embed = new EmbedBuilder()
                        .setTitle('Pedido de Puxar Membros')
                        .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi finalizada, verifique o status abaixo.`)
                        .setColor('Green')
                        .setFields(
                            { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Finalizado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        )

                    const embedlogs = new EmbedBuilder()
                        .setTitle('Logs de Puxar Membros')
                        .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
                        .setColor('Green')
                        .setFields(
                            { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Finalizado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                        )

                    let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
                    let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)
                    mensagemlog.edit({ embeds: [embedlogs] })
                    mensagem.edit({ embeds: [embed] })
                    return
                }

                // setTimeout(loop, 1);
            }

        } catch (err) {
            // erro
            if (err.response.data.code == 10004) {

                PullRequest.set(`${dddd[key].ID}.status`, 'Cancelado')

                const embed = new EmbedBuilder()
                    .setTitle('Pedido de Puxar Membros')
                    .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação foi cancelada, verifique o status abaixo.`)
                    .setColor('Red')
                    .setFields(
                        { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver} (Não Encontrado)\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Cancelado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                const embedlogs = new EmbedBuilder()
                    .setTitle('Logs de Puxar Membros')
                    .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
                    .setColor('Red')
                    .setFields(
                        { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver} (Não Encontrado)\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Cancelado\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
                    )

                let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
                let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)

                mensagemlog.edit({ embeds: [embedlogs] })

                mensagem.edit({ embeds: [embed] })

                return

            }
            if (err.response.data.code == 30001 || err.response.data.code == 40007) {
                ignoraruser.push(userResult.userid)
                console.log(userResult.userid)
                return;
            }


            if (err.response.data.code == 50025 || err.response.data.code == 10013) {
                let danificaruser = information.usuarios.find(user => user.userid == userResult.userid)
                danificaruser.access_token = 'unauthorized'
                registros.set(dddd[key].data.token, information)
            }

            console.log(err.response.data)





        }


        PullRequest.set(`${dddd[key].ID}.qtdpuxados`, ff.qtdpuxados)
        const embed = new EmbedBuilder()
            .setTitle('Pedido de Puxar Membros')
            .setDescription(`Olá <@!${dddd[key].data.message.user}>, Sua solicitação está em andamento, verifique o status abaixo.`)
            .setColor('Yellow')
            .setFields(
                { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Em andamento\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            )

        const embedlogs = new EmbedBuilder()
            .setTitle('Logs de Puxar Membros')
            .setDescription(`O usuário <@!${dddd[key].data.message.user}> fez um pedido de puxar membros, verifique o status abaixo.`)
            .setColor('Yellow')
            .setFields(
                { name: 'Informações:', value: `- Servidor: \`${dddd[key].data.idnewserver}\`\n- Membros: \`${ff.qtdpuxados}\`/\`${ff.quantidade}\`\n- Status: \`Em andamento\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            )


        let channellog = await client.channels.fetch(dddd[key].data.messagelog.channel)
        let mensagemlog = await channellog.messages.fetch(dddd[key].data.messagelog.id)

        mensagemlog.edit({ embeds: [embedlogs] })
        mensagem.edit({ embeds: [embed] })


    }






}


function generateToken() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbersAndLetters = '0123456789abcdefghijklmnopqrstuvwxyz';

    let token = letters.charAt(Math.floor(Math.random() * letters.length)); // Primeira letra

    for (let i = 0; i < 10; i++) {
        token += numbersAndLetters.charAt(Math.floor(Math.random() * numbersAndLetters.length));
    }

    return token;
}

module.exports = {
    PullMembers
}
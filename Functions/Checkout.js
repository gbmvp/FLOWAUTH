const { EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { messagesgeral, General, registros, Carinho } = require("../DataBaseJson");
const axios = require('axios');
const { primeirapg, generateToken } = require("./GerenciarAuth");

async function VerificarPagamento(client) {
    var f = messagesgeral.fetchAll()

    for (let i = 0; i < f.length; i++) {
        const element = f[i];
        if (element.data.message !== undefined) {
            if (element.data.pagamentos?.type == 'pix') {
                var res = await axios.get(`https://api.mercadopago.com/v1/payments/${element.data.pagamentos.id}`, {
                    headers: {
                        Authorization: `Bearer ${General.get('tokenmp')}`
                    }
                })

                if (res.data.status == 'approved') {
                    messagesgeral.delete(element.ID)

                    messagesgeral.set(element.ID, {
                        id: element.ID,
                        user: element.data.user,
                        server: element.data.server,
                        token: element.data.token
                    })


                    // const logs = await client.channels.fetch(General.get(`${element.data.server}.canallogs`))
                    const user = await client.users.fetch(element.data.user)
                    const guild = await client.guilds.fetch(element.data.server)

                    // const cargocliente = await guild.roles.fetch(General.get(`${element.data.server}.cliente`))
                    // guild.members.cache.get(element.data.user).roles.add(cargocliente)

                    // adicionar tempo ao banco de dados
                    const tiposParaExpiracao = {
                        'Diário': 1 * 24 * 60 * 60 * 1000,
                        'Semanal': 7 * 24 * 60 * 60 * 1000,
                        'Mensal': 30 * 24 * 60 * 60 * 1000
                    }

                    const tokeninicial = element.data.token;
                    if (tiposParaExpiracao[element.data.tipo]) {

                        const expiracaoAtual = registros.get(`${tokeninicial}.timestamp`);
                        let novaExpiracao

                        if (expiracaoAtual < Date.now()) {
                            novaExpiracao = Date.now() + tiposParaExpiracao[element.data.tipo];
                        } else {
                            novaExpiracao = expiracaoAtual + tiposParaExpiracao[element.data.tipo];
                        }

                        registros.delete(`${tokeninicial}.status`)
                        registros.delete(`${tokeninicial}.inativo`)
                        await registros.set(`${tokeninicial}.timestamp`, novaExpiracao)

                    } else if (element.data.tipo === 'cooldown' || element.data.tipo === 'pullmails' || element.data.tipo === 'divulgacao') {
                        registros.set(`${tokeninicial}.adicionais`, [...registros.get(`${tokeninicial}.adicionais`), element.data.tipo]);
                    }


                    const horario = `<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:R>)`
                    const embedlogs = new EmbedBuilder()
                        .setAuthor({ name: `Compra Efetuada #${element.data.pagamentos.id}` })
                        .setColor('Green')
                        .setDescription(`- Um pagamento foi aprovado com sucesso.`)
                        .setFields(
                            { name: `Comprador:`, value: `${user} | ${user.username}` },
                            { name: 'Valor Pago:', value: `\`R$ ${Number(element.data.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`` },
                            { name: `Horário:`, value: `${horario}` }
                        )

                    let asasasas = registros.get(tokeninicial)

                    const token = (asasasas.token).substring(0, 15) + '...'
                    const data = `<t:${Math.floor(asasasas.timestamp / 1000)}:R>`

                    let adicional1 = asasasas.adicionais.includes('cooldown') ? `✅ CoolDown - ${Number(General.get('adicional_cooldown')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `❌ CoolDown - ${Number(General.get('adicional_cooldown')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    let adicional2 = asasasas.adicionais.includes('pullmails') ? `✅ Pull Email's - ${Number(General.get('adicional_pullmails')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `❌ Pull Email's - ${Number(General.get('adicional_pullmails')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                    let adicional3 = asasasas.adicionais.includes('divulgacao') ? `✅ Remov. Divulgação - ${Number(General.get('adicional_divulgacao')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : `❌ Remov. Divulgação - ${Number(General.get('adicional_divulgacao')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`

                    const request = await fetch('https://discord.com/api/users/@me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bot ${asasasas.token}`,
                            'Content-Type': 'application/json',
                        },
                    })

                    let dsdsds = await request.json()
                    let active = 0
                    if (dsdsds.code == 0) {
                        active = 1
                    }


                    let hora = new Date().getHours()
                    let saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
                    const usuariosUnicos = new Set();

                    asasasas.usuarios.forEach(usuario => {
                        if (usuario.access_token !== 'unauthorized') {
                            usuariosUnicos.add(usuario.userid);
                        }
                    });
                    const membrosOAuth2 = usuariosUnicos.size || '0';

                    const embed = new EmbedBuilder()
                        .setAuthor({ name: `Configurações do seu OAuth2  | ${dsdsds.username == undefined ? `Desconhecido` : dsdsds.username}`, })
                        .setDescription(`- ${saudacao} senhor(a) **${user.globalName}**, como posso lhe ajudar?`)
                        .setColor(`#2b2d31`)
                        .setFields(
                            { name: `Token da Aplicação`, value: `\`${active == 1 ? `Token Inválido` : token}\``, inline: true },
                            { name: `Client Secret`, value: `\`${(asasasas.client_secret).substring(0, 15) + '...'}\``, inline: true },
                            { name: `Expira em`, value: `${data}`, inline: true },
                            { name: `Adicionais Disponíveis`, value: `- \`${adicional1}\`\n- \`${adicional2}\`\n- \`${adicional3}\``, inline: true },
                            { name: `Informações`, value: `- \`Membros OAuth2: ${membrosOAuth2}\`\n- \`Aplicação Vinculada: ${dsdsds.username == undefined ? `Desconhecido` : dsdsds.username}\`\n- \`Servidor Principal: ${asasasas?.principalserver?.name == undefined ? `Não definido` : asasasas?.principalserver?.name}\``, inline: true }
                        )

                    if (asasasas.inativo) {
                        embed.addFields({ name: `Aviso:`, value: `Seu bot está inativo, para reativá-lo, realize o pagamento da sua assinatura!` })
                    }

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('recuperarmembros')
                            .setLabel('Recuperar Membros')
                            .setEmoji('1230562783553261688')
                            .setDisabled(asasasas.inativo ? true : false)
                            .setStyle(3),
                        new ButtonBuilder()
                            .setCustomId('pullmails')
                            .setLabel('Puxar Emails')
                            .setEmoji('1234606184711979178')
                            .setDisabled(asasasas.inativo || !asasasas.adicionais.includes('pullmails') ? true : false)
                            .setStyle(2),
                        new ButtonBuilder()
                            .setURL(`https://discord.com/oauth2/authorize?client_id=${dsdsds.id}&scope=bot&permissions=8`)
                            .setLabel('Adicionar Aplicação')
                            .setDisabled(asasasas.inativo ? true : false)
                            .setStyle(5),
                    )

                    const row2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('gerenciarservidores')
                            .setLabel('Geren. Servidores')
                            .setEmoji('1233103066975309984')
                            .setDisabled(asasasas.inativo ? true : false)
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId('gerenciarassinatura')
                            .setLabel('Geren. Assinatura')
                            .setEmoji('1233103068942569543')
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId('gerenciarbot')
                            .setLabel('Geren. Aplicação')
                            .setEmoji('1230562816600051804')
                            .setDisabled(asasasas.inativo ? true : false)
                            .setStyle(2),
                    )

                    try {
                        await axios.patch(`https://discord.com/api/webhooks/${element.data.message.applicationid}/${element.data.message.webhookID}/messages/${element.data.message.msgid}`, {
                            flags: 64,
                            embeds: [embed],
                            components: [row, row2],
                            attachments: []
                        })
                    } catch (error) {
                        console.log('Error Checkout', error)
                    }

                }
            }
        }
    }
}
async function Vpagamento2(client) {
    var f = Carinho.fetchAll()

    for (let i = 0; i < f.length; i++) {
        const element = f[i];
        if (element.data.message !== undefined) {
            if (element.data.pagamentos?.type == 'pix') {
                var res = await axios.get(`https://api.mercadopago.com/v1/payments/${element.data.pagamentos.id}`, {
                    headers: {
                        Authorization: `Bearer ${General.get('tokenmp')}`
                    }
                })

                if (res.data.status == 'approved') {
                    Carinho.delete(element.ID)

                    const tiposParaExpiracao = {
                        'Diário': 1,
                        'Semanal': 7,
                        'Mensal': 30
                    }
                    const tokeninicial = generateToken()

                    let arrayadicional = []

                    if (element.data.adicional) {
                        if (element.data.adicional.pullmails) {
                            arrayadicional.push('pullmails')
                        }
                        if (element.data.adicional.cooldown) {
                            arrayadicional.push('cooldown')
                        }
                        if (element.data.adicional.divulgacao) {
                            arrayadicional.push('divulgacao')
                        }
                    }

                    messagesgeral.set(`${tokeninicial}`, {
                        user: element.data.user,
                        canal: element.data.canal,
                        adicional: arrayadicional,
                        valor: element.data.valor,
                        tipo: element.data.tipo,
                    })

                    const msg = `- Prezado(a) <@${element.data.user}>, seu pagamento foi aprovado com sucesso. pressione o botão abaixo e envie as seguintes informações:\n - Token da Aplicação\n - Client Secret\n- Após o envio, seu bot será cadastrado com sucesso!`
                    const enviarbot = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`enviarbot_${tokeninicial}`)
                            .setLabel('Enviar Bot')
                            .setEmoji('1236099200022872114')
                            .setStyle(2)
                    )

                    const canal = client.channels.cache.get(element.data.channel)

                    try {
                        await canal.bulkDelete(100)
                        await canal.send({ content: msg, components: [enviarbot] })
                    } catch (error) {
                        
                    }
                  
                }
            }
        }
    }
}

module.exports = {
    VerificarPagamento,
    Vpagamento2
};
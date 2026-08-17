const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Attachment, AttachmentBuilder } = require('discord.js');
const { registros, messagesgeral, configuracoes, General } = require('../DataBaseJson');
const axios = require('axios');


let joaozinhodelay = {};

async function primeirapg(client, interaction, a, valor) {

    let asasasas = registros.get(valor)

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
        .setDescription(`- ${saudacao} senhor(a) **${interaction.user.globalName}**, como posso lhe ajudar?`)
        .setColor(`#2b2d31`)
        .setFields(
            { name: `Token da Aplicação`, value: `\`${active == 1 ? `Token Inválido` : token}\``, inline: true },
            { name: `Client Secret`, value: `\`${(asasasas.client_secret).substring(0, 15) + '...'}\``, inline: true },
            { name: `Expira em`, value: `${data}`, inline: true },
            { name: `Adicionais Disponíveis`, value: `- \`${adicional1}\`\n- \`${adicional2}\`\n- \`${adicional3}\``, inline: true },
            { name: `Informações`, value: `- \`Membros OAuth2: ${membrosOAuth2}\`\n- \`Aplicação: ${dsdsds.username == undefined ? `Desconhecido` : dsdsds.username}\`\n- \`S. Principal: ${asasasas?.principalserver?.name == undefined ? `Não definido` : asasasas?.principalserver?.name}\``, inline: true }
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
            .setDisabled(false) //asasasas.inativo ? true : false
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

    if (a != 1) {
        interaction.reply({ embeds: [embed], components: [row, row2], ephemeral: true, fetchReply: true })
        let message = await interaction.fetchReply()
        messagesgeral.set(message.id, { id: message.id, user: interaction.user.id, token: valor })

    } else {
        interaction.update({ embeds: [embed], components: [row, row2], ephemeral: true })
    }
}

async function gerenciarbot(client, interaction, a) {

    // crie delay de 30 segundos seta o tempo direto no codigo



    let infos = messagesgeral.get(interaction.message.id)
    let users = registros.get(infos.token)

    const request = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${users.token}`,
            'Content-Type': 'application/json',
        },
    })

    const dsdsds = await request.json()

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento da Aplicação | ${dsdsds.username}`, })
        .setDescription(`- Aqui você pode gerenciar a aplicação vinculada ao seu OAuth2.`)
        .setColor(`#2b2d31`)
        .setFields(
            { name: `Nome da Aplicação`, value: `\`${dsdsds.username}\``, inline: true },
            { name: `Token da Aplicação`, value: `\`${users.token.substring(0, 15) + '...'}\``, inline: true },
            { name: `Client Secret`, value: `\`${users.client_secret.substring(0, 15) + '...'}\``, inline: true },
            { name: `Informações Importante:`, value: `- Ao trocar o token da aplicação, use apenas o token do mesmo bot. Se usar um token diferente, a aplicação será desvinculada do OAuth2, levando à perda de configurações e membros associados.`, inline: true },
        )

    const selectmenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('selectmenu')
            .setPlaceholder('🤖 Edite seu BOT aqui')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Nome da Aplicação')
                    .setValue('nomeaplicacao')
                    .setDescription('Edite o nome da aplicação')
                    .setEmoji('1233103066975309984'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Token da Aplicação')
                    .setValue('tokenaplicacao')
                    .setDescription('Edite o token da aplicação')
                    .setEmoji('1233103066975309984'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Client Secret')
                    .setValue('clientsecret')
                    .setDescription('Edite o client secret')
                    .setEmoji('1233103066975309984'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Página Inicial')
                    .setValue('voltarprimeirapg')
                    .setDescription('Voltar para a página inicial')
                    .setEmoji('1106069998331514930')
            )
    )

    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('GerarAPIToken')
            .setLabel('Gerar API (Token)')
            .setEmoji('1232782650385629299')
            .setStyle(2)
    )

    if (a != 1) {
        interaction.update({ content: '', embeds: [embed], components: [selectmenu, botao], ephemeral: true })
    } else {
        interaction.editReply({ content: '', embeds: [embed], components: [selectmenu, botao], ephemeral: true })
    }
}
async function gerenciarservidores(client, interaction, page) {

    if (joaozinhodelay[interaction.user.id] && joaozinhodelay[interaction.user.id] > Date.now()) {
        return interaction.reply({ content: `⏱️ Aguarde <t:${Math.floor(joaozinhodelay[interaction.user.id]/ 1000)}:R> para realizar uma nova ação.`, ephemeral: true })
    }

    joaozinhodelay[interaction.user.id] = Date.now() + 15000

    await interaction.update({ content: 'Carregando...', ephemeral: true })

    let infos = messagesgeral.get(interaction.message.id)
    let users = registros.get(infos.token)


    const request = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${users.token}`,
            'Content-Type': 'application/json',
        },
    })

    const dsdsds = await request.json()


    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento de Servidores | ${dsdsds.username}`, })
        .setDescription(`- Aqui você pode gerenciar os servidores vinculados ao seu OAuth2.`)
        .setColor(`#2b2d31`)



    const response = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
            Authorization: `Bot ${users.token}`,
        },
    });
    const guilds = response.data;


    let options = []
    const allUserIds = new Set();



    for (const guild of guilds) {
        const usuariosDoServidor = users.usuarios.filter(usuario => {
            return usuario.serverid.some(server => server.idserver === guild.id) && usuario.access_token !== 'unauthorized';
        });
        usuariosDoServidor.forEach(usuario => {
            usuario.serverid = usuario.serverid.filter(id => id.idserver !== guild.id);
        });

        allUserIds.add(guild.id);

        options.push({
            label: `${guild.name}`,
            emoji: `1226700825565593683`,
            description: `👥 Membros OAuth2: ${usuariosDoServidor.length}`,
            value: `${guild.id}_${guild.name}`,
        });
    }




    const usuariosForaDosServidores = users.usuarios.filter(usuario => {
        return !allUserIds.has(usuario.serverid) && usuario.access_token !== 'unauthorized';
    });
    const contagemUsuariosPorServidor = {};

    usuariosForaDosServidores.forEach(usuario => {
        usuario.serverid.forEach(id => {
            if (!contagemUsuariosPorServidor[id]) {
                contagemUsuariosPorServidor[id] = {
                    count: 1,
                    servername: id.servername
                };
            } else {
                contagemUsuariosPorServidor[id].count++;
            }
        });
    });



    for (const [serverid, { count, servername }] of Object.entries(contagemUsuariosPorServidor)) {
        options.push({
            label: `${servername} (DESVINCULADO)`,
            emoji: `1226700884025802802`,
            description: `👥 Membro OAuth2: ${count}`,
            value: `${serverid}_${servername}_off`,
        });
    }
    if (options.length == 0) {
        interaction.editReply({ content: `` })
        interaction.followUp({ content: '❌ Essa aplicação não está em nenhum servidor ou não há membros autenticados.', ephemeral: true });
        return;
    }




    if (page == undefined) page = 1
    const pageSize = 10;
    const totalPages = Math.ceil(options.length / pageSize);
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;

    const currentPage = options.slice(startIdx, endIdx);

    // return

    const select = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`servidores_${page}`)
            .setPlaceholder('Selecione um servidor')
            .addOptions(currentPage)
    )
    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('pganterior')
            .setLabel('Anterior')
            .setStyle(2)
            .setDisabled(page == 1 ? true : false),
        new ButtonBuilder()
            .setCustomId('pagina')
            .setLabel(`${page}/${totalPages}`)
            .setDisabled(true)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('pgseguinte')
            .setLabel('Seguinte')
            .setDisabled(page == totalPages ? true : false)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('voltar_primeirapg')
            .setEmoji('1106069998331514930')
            .setStyle(2),
    )
    messagesgeral.set(`${interaction.message.id}.page`, { page: page, totalPages: totalPages })


    interaction.editReply({ embeds: [embed], components: [botao, select], ephemeral: true, content: `` })
}
async function gerenciarassinatura(client, interaction) {

    let infos = messagesgeral.get(interaction.message.id)
    let users = registros.get(infos.token)

    const request = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${users.token}`,
            'Content-Type': 'application/json',
        },
    })

    const dsdsds = await request.json()

    let adicional1 = users.adicionais.includes('cooldown') ? `- \`✅ Cooldown - ${Number(General.get('adicional_cooldown')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`` : null;
    let adicional2 = users.adicionais.includes('pullmails') ? `- \`✅ Pull Email's - ${Number(General.get('adicional_pullmails')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`` : null;
    let adicional3 = users.adicionais.includes('divulgacao') ? `- \`✅ Divulgação - ${Number(General.get('adicional_divulgacao')).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`` : null;

    // Crie uma mensagem apenas com os adicionais certos
    let mensagem = "";

    if (adicional1 !== null) mensagem += adicional1 + "\n";
    if (adicional2 !== null) mensagem += adicional2 + "\n";
    if (adicional3 !== null) mensagem += adicional3 + "\n";

    // Remova a última quebra de linha, se necessário
    mensagem = mensagem.trimEnd();
    const data = `<t:${Math.floor(users.timestamp / 1000)}:D> (<t:${Math.floor(users.timestamp / 1000)}:R>)`

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento de Adicionais | ${dsdsds.username}`, })
        .setDescription(`- Aqui você pode gerenciar a assinatura do seu OAuth2.`)
        .setColor(`#2b2d31`)
        .setFields(
            { name: `Expira em`, value: `${data}`, inline: true },
            { name: `Adicionais Ativos`, value: `${mensagem == `` ? `Nenhum adicional adquirido!` : mensagem}` },
        )

    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('renovarassinatura')
            .setLabel('Renovar Assinatura')
            .setDisabled(true)
            .setEmoji('1233103068942569543')
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('adquiriradicionais')
            .setLabel('Adquirir Adicionais')
            .setEmoji('1234653175617687704')
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('voltar_primeirapg')
            .setEmoji('1106069998331514930')
            .setStyle(2),
    )

    interaction.update({ embeds: [embed], components: [botao], ephemeral: true })
}

async function adquiriradicionais(client, interaction) {

    let infos = messagesgeral.get(interaction.message.id)
    let users = registros.get(infos.token)

    const request = await fetch('https://discord.com/api/users/@me', {
        method: 'GET',
        headers: {
            'Authorization': `Bot ${users.token}`,
            'Content-Type': 'application/json',
        },
    })

    const dsdsds = await request.json()

    let adicional1 = users.adicionais.includes('cooldown') ? `\`✅\`` : `\`❌\``
    let adicional2 = users.adicionais.includes('pullmails') ? `\`✅\`` : `\`❌\``
    let adicional3 = users.adicionais.includes('divulgacao') ? `\`✅\`` : `\`❌\``

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento de Adicionais | ${dsdsds.username}`, })
        .setDescription(`- Aqui você pode adquirir os adicionais disponíveis para o seu OAuth2.`)
        .setColor(`#2b2d31`)
        .setFields(
            { name: `Sistema de CoolDown ${adicional1}`, value: `- Otimize sua recuperação de membros com o sistema de CoolDown! Este adicional elimina o tempo de espera, permitindo que você recupere seus membros instantaneamente.` },
            { name: `Sistema de PullEmai's ${adicional2}`, value: `- Aproveite o sistema de Email para capturar os endereços de email dos membros autenticados em seu servidor. Com essa informação valiosa, você poderá planejar projetos e se comunicar de forma mais eficaz.` },
            { name: `Sistema de Divulgação ${adicional3}`, value: `- Ao adquirir este adicional, a divulgação automática do nosso servidor é removida, liberando espaço para que os usuários promovam seus próprios conteúdos de forma personalizada.` },
        )

    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('adquirir_cooldown')
            .setLabel('Adquirir Cooldown')
            .setEmoji('1233103068942569543')
            .setDisabled(adicional1 === `\`✅\`` ? true : false)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('adquirir_pullmails')
            .setLabel('Adquirir Pull Email\'s')
            .setEmoji('1233103068942569543')
            .setDisabled(adicional2 === `\`✅\`` ? true : false)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('adquirir_divulgacao')
            .setLabel('Adquirir Divulgação')
            .setEmoji('1233103068942569543')
            .setDisabled(adicional3 === `\`✅\`` ? true : false)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('voltar_gerenciarassinatura')
            .setEmoji('1106069998331514930')
            .setStyle(2),
    )

    interaction.update({ embeds: [embed], components: [botao], ephemeral: true })
}
async function renovarassinatura(client, interaction) {

    const mensal = Number(General.get('plano_mensal'))
    const semanal = Number(General.get('plano_semanal'))
    const diario = Number(General.get('plano_diario'))

    let infos = messagesgeral.get(interaction.message.id)
    let users = registros.get(infos.token)


    let valoradicionais = 0
    if (users.adicionais.includes('cooldown')) {
        valoradicionais = valoradicionais + Number(General.get('adicional_cooldown'))
    }
    if (users.adicionais.includes('pullmails')) {
        valoradicionais = valoradicionais + Number(General.get('adicional_pullmails'))
    }
    if (users.adicionais.includes('divulgacao')) {
        valoradicionais = valoradicionais + Number(General.get('adicional_divulgacao'))
    }




    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento de Assinatura`, })
        .setDescription('- Escolha o tipo de renovação desejada.')
        .setColor(`#2b2d31`)
        .setFields(
            { name: `Valores Planos:`, value: `- Diário: \`${Number(diario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`\n- Semanal: \`${Number(semanal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`\n- Mensal: \`${Number(mensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\``, inline: true },
            { name: `Valores C/ Adicionais:`, value: `- Diário: \`${Number(diario + valoradicionais).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`\n- Semanal: \`${Number(semanal + valoradicionais).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\`\n- Mensal: \`${Number(mensal + valoradicionais).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\``, inline: true },
            { name: `Importante:`, value: `- Na renovação da assinatura, será necessário efetuar o pagamento do valor total do plano selecionado, acrescido dos adicionais, se houverem.` },
        )

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('diario')
            .setLabel(`Diária (24h)`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('semanal')
            .setLabel(`Semanal (7d)`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('mensal')
            .setLabel(`Mensal (30d)`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId('voltar_gerenciarassinatura')
            .setEmoji('1106069998331514930')
            .setStyle(2),
    )

    interaction.update({ embeds: [embed], components: [row] })
}

async function dentroservidor(client, interaction, status, id, name) {

    // https://discord.com/oauth2/authorize?client_id=1228129021397827614&response_type=code&redirect_uri=https%3A%2F%2Fpromisse.app%2Fapi%2Flogin&scope=identify+guilds.join+email
    let value = null
    let nameserver = null
    let idserver = null
    try {
        value = interaction.values[0]
        nameserver = value.split('_')[1]
        idserver = value.split('_')[0]
    } catch (error) {
        nameserver = name
        idserver = id
    }


    const mensagem = messagesgeral.get(interaction.message.id)
    const infos = registros.get(mensagem.token)

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Gerenciamento de Servidor | ${nameserver}`, })
        .setDescription(`- Aqui você pode gerenciar os membros do ${nameserver}.`)
        .setColor(`#2b2d31`)

    let botao

    const info2 = configuracoes.get(idserver)

    let members2 = (infos?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized');
    dd = members2.filter(usuario => {
        return usuario.serverid.some(server => server.idserver === idserver);
    });

    if (status == false) {
        embed.setFields(
            { name: `Informações`, value: `- \`Membros OAuth2: ${dd.length}\``, inline: true },
            { name: `Importante`, value: `O servidor **${nameserver}** está desvinculado`, inline: true },
        )
        botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`puxarmembros_${idserver}`)
                .setLabel('Puxar Membros')
                .setEmoji('1230562783553261688')
                .setStyle(3),
            new ButtonBuilder()
                .setCustomId('voltar_gerenciarservidores')
                .setEmoji('1106069998331514930')
                .setStyle(2),
        )
    } else {
        embed.setFields(
            { name: `Informações`, value: `- \`Membros OAuth2: ${dd.length}\`\n- \`Servidor Principal: ${infos?.principalserver?.id == idserver ? `✅` : `❌`}\`\n- \`Cargo Configurado: ${info2?.cargos?.length == undefined ? `❌` : `✅ (${info2?.cargos?.length})`}\`\n- \`Log Configurada: ${info2?.webhook == undefined ? `❌` : `✅`}\``, inline: true },
        )

        botao = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`puxarmembros_${idserver}`)
                .setLabel('Puxar Membros')
                .setEmoji('1230562783553261688')
                .setStyle(3),
            new ButtonBuilder()
                .setCustomId(`servidorprincipal_${idserver}_${nameserver}`)
                .setLabel('Adicionar como Principal')
                .setEmoji('1233103066975309984')
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId(`enviarmensagem_${idserver}`)
                .setLabel('Enviar Mensagem')
                .setEmoji('1233103066975309984')
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId(`Configurações_${idserver}_${nameserver}`)
                .setLabel('Configurações')
                .setEmoji('1233103066975309984')
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId('voltar_gerenciarservidores')
                .setEmoji('1106069998331514930')
                .setStyle(2),
        )
    }

    await interaction.update({ embeds: [embed], components: [botao], ephemeral: true })
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
    primeirapg,
    gerenciarservidores,
    gerenciarassinatura,
    gerenciarbot,
    generateToken,
    dentroservidor,
    renovarassinatura,
    adquiriradicionais
}
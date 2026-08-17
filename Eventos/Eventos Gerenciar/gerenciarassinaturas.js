const { ActionRowBuilder, AttachmentBuilder, EmbedBuilder, ButtonBuilder, InteractionType, ChannelType, PermissionsBitField, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } = require('discord.js');
const { General, messagesgeral, registros } = require('../../DataBaseJson');
const mercadopago = require('mercadopago');

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton()) {
            if (interaction.customId === 'diario') {
                const plano = General.get(`plano_diario`)
                let infos = messagesgeral.get(interaction.message.id)
                let users = registros.get(infos.token)
                let adicional1 = users.adicionais.includes('cooldown') ? `${General.get('adicional_cooldown')}` : 0
                let adicional2 = users.adicionais.includes('pullmails') ? `${General.get('adicional_pullmails')}` : 0
                let adicional3 = users.adicionais.includes('divulgacao') ? `${General.get('adicional_divulgacao')}` : 0

                const valor = Number(plano) + Number(adicional1) + Number(adicional2) + Number(adicional3)
                GerarPagamento(client, interaction, valor, 'Diário')
            }
            if (interaction.customId === 'semanal') {
                const plano = General.get(`plano_semanal`)
                const infos = messagesgeral.get(interaction.message.id)
                const users = registros.get(infos.token)
                const adicional1 = users.adicionais.includes('cooldown') ? `${General.get('adicional_cooldown')}` : 0
                const adicional2 = users.adicionais.includes('pullmails') ? `${General.get('adicional_pullmails')}` : 0
                const adicional3 = users.adicionais.includes('divulgacao') ? `${General.get('adicional_divulgacao')}` : 0

                const valor = Number(plano) + Number(adicional1) + Number(adicional2) + Number(adicional3)
                GerarPagamento(client, interaction, valor, 'Semanal')
            }
            if (interaction.customId === 'mensal') {
                const plano = General.get(`plano_mensal`)
                const infos = messagesgeral.get(interaction.message.id)
                const users = registros.get(infos.token)
                const adicional1 = users.adicionais.includes('cooldown') ? `${General.get('adicional_cooldown')}` : 0
                const adicional2 = users.adicionais.includes('pullmails') ? `${General.get('adicional_pullmails')}` : 0
                const adicional3 = users.adicionais.includes('divulgacao') ? `${General.get('adicional_divulgacao')}` : 0

                const valor = Number(plano) + Number(adicional1) + Number(adicional2) + Number(adicional3)
                GerarPagamento(client, interaction, valor, 'Mensal')
            }
            if (interaction.customId === 'copiarecolar') {
                const pix = messagesgeral.get(`${interaction.message.id}.pagamentos.pixcopiaecola`)
                interaction.reply({ content: `${pix}`, ephemeral: true })
            }
            if (interaction.customId.startsWith('adquirir_')) {
                const plano = General.get(`adicional_${interaction.customId.split('_')[1]}`)
                const infos = messagesgeral.get(interaction.message.id)

                GerarPagamento(client, interaction, plano, interaction.customId.split('_')[1])
            }
        }
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId === '') {
            }
        }
    }
}

async function GerarPagamento(client, interaction, valor, tipo) {

    interaction.update({ content: `🔄️ Gerando pagamento...`, components: [], embeds: [], ephemeral: true })
    messagesgeral.set(`${interaction.message.id}.valor`, Number(valor))
    messagesgeral.set(`${interaction.message.id}.tipo`, tipo)
    messagesgeral.set(`${interaction.message.id}.server`, interaction.guild.id)

    var payment_data = {
        transaction_amount: valor,
        description: `${tipo} | ${interaction.user.username}`,
        payment_method_id: 'pix',
        payer: {
            email: `${interaction.user.username}@gmail.com`,
            first_name: `Victor André`,
            last_name: `Ricardo Almeida`,
            identification: {
                type: 'CPF',
                number: '15084299872'
            },

            address: {
                zip_code: '86063190',
                street_name: 'Rua Jácomo Piccinin',
                street_number: '971',
                neighborhood: 'Pinheiros',
                city: 'Londrina',
                federal_unit: 'PR'
            }
        }
    }
    mercadopago.configurations.setAccessToken(General.get('tokenmp'));
    await mercadopago.payment.create(payment_data)
        .then(async function (data) {
            await messagesgeral.set(`${interaction.message.id}.message`, { webhookID: interaction.token, applicationid: interaction.applicationId, msgid: interaction.message.id, channelid: interaction.channel.id })
            await messagesgeral.set(`${interaction.message.id}.pagamentos`, { type: 'pix', id: data.body.id, QrCode: data.body.point_of_interaction.transaction_data.qr_code_base64, pixcopiaecola: data.body.point_of_interaction.transaction_data.qr_code })
        }).catch(function (error) {
            console.log('Error Pagamento', error)
        });

    var t = messagesgeral.get(`${interaction.message.id}`)

    const buffer = Buffer.from(t.pagamentos.QrCode, "base64");
    const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setColor("#2f3136")
        .setTitle(`Pagamento via Pix criado`)
        .setFields(
            { name: `Código copia e cola`, value: `\`\`\`${t.pagamentos.pixcopiaecola}\`\`\``, inline: true },
        )
        .setFooter({ text: `${interaction.guild.name} - Pagamento expira em 10 min` })
        .setTimestamp()
        .setImage(`attachment://payment.png`)

    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('copiarecolar')
            .setLabel('Copiar e Colar')
            .setStyle(2)
            .setEmoji('1233200554252042260'),
    )

    interaction.editReply({ content: '', embeds: [embed], files: [attachment], components: [botao], ephemeral: true })
}
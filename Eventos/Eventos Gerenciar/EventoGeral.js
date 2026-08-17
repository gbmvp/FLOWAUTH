const { registros, messagesgeral, Licensa } = require("../../DataBaseJson");

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton()) {
            if (interaction.customId === 'GerarAPIToken') {
                let token = messagesgeral.get(interaction.message.id)
                let user = registros.get(token.token)

                const crypto = require('crypto');

                function generateHash(data) {
                    const jsonString = JSON.stringify(data);
                    const hash = crypto.createHash('sha256')
                        .update(jsonString)
                        .digest('hex');
                    return hash;
                }
                
                function generateSequence(data) {
                    // Gerando um valor aleatório de 6 caracteres
                    const randomValue = Math.random().toString(36).substring(2, 8);
                    
                    const { botid, token, userid } = data;
                    const hash = generateHash({ token, botid, userid, randomValue });
                    const finalSequence = `${user.owner[0]}-${hash}`;
                    return finalSequence;
                }
                
                const inputData = {
                    botid: user.botid,
                    userid: user.owner,
                    registro: token.token
                };
                const result = generateSequence(inputData);

                Licensa.set(token.token, { token: result, registro: token.token})

                interaction.reply({ content: `✅ Token Gerado com sucesso: ||${result}||\n\n- Essa mensagem será apagada em 15 segundos, o token e visivel apenas uma vez caso perca gere outro!`, ephemeral: true }).then(msg => {
                    setTimeout(async () => {
                        try {
                            await  msg.delete()
                        } catch (error) {
                            
                        }
                       
                    }, 15000)
                
                })



              
            }
        }


        if (interaction.isAutocomplete()) {
            if (interaction.commandName == 'auth') {



                const produtosEncontrados = registros.filter(registro => registro.data.owner.includes(interaction.user.id));
                const respostas = await Promise.all(produtosEncontrados.map(async produto => {
                    const token = produto.data.token;
                    const request = await fetch('https://discord.com/api/users/@me', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bot ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                
                    const respostaJson = await request.json();
                    let active = null;
                
                    if (respostaJson.message === "401: Unauthorized") {
                        active = `(Desabilitado - Token inválido)`;
                    }
                
                    return {
                        name: `🔖 Nome - ${active === null ? respostaJson.username : active} | 🧱 ID - ${produto.ID.toString().toUpperCase()}`,
                        value: `${produto.ID}`
                    };
                }));
                
                const resposta = respostas.length === 0 ? [{ name: "Nenhum produto registrado foi encontrado", value: "nada" }] : respostas;
                interaction.respond(resposta);

            }

        }
    }
}
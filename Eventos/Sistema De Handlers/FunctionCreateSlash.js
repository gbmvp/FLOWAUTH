module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        if (interaction.isChatInputCommand()) {

            const cmd = client.slashCommands.get(interaction.commandName);

            if (!cmd) return interaction.reply({content: `Ocorreu algum erro amigo.`, ephemeral: true});

            interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

            cmd.run(client, interaction)

        }
    }
}
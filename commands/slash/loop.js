const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Atur mode pengulangan')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'none' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )
        ),
    securityToken: COMMAND_SECURITY_TOKEN,

    async execute(interaction, client) {
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ Inti sistem offline - Perintah tidak tersedia')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
        }

        interaction.shivaValidated = true;
        interaction.securityToken = COMMAND_SECURITY_TOKEN;

        await interaction.deferReply();

        const ConditionChecker = require('../../utils/checks');
        const checker = new ConditionChecker(client);

        try {
            const conditions = await checker.checkMusicConditions(
                interaction.guild.id,
                interaction.user.id,
                interaction.member.voice?.channelId
            );

            if (!conditions.hasActivePlayer) {
                const embed = new EmbedBuilder().setDescription('❌ Tidak ada musik yang sedang diputar!');
                return interaction.editReply({ embeds: [embed] })
                    .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 3000));
            }

            if (!conditions.sameVoiceChannel) {
                const embed = new EmbedBuilder().setDescription('❌ Anda harus berada di saluran suara yang sama dengan bot!');
                return interaction.editReply({ embeds: [embed] })
                    .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 3000));
            }

            const mode = interaction.options.getString('mode');
            const player = conditions.player;

            player.setLoop(mode);

            const modeEmojis = { none: '➡️', track: '🔂', queue: '🔁' };
            const modeNames = { none: 'Off', track: 'Track', queue: 'Queue' };

            const embed = new EmbedBuilder().setDescription(`${modeEmojis[mode]} Loop mode set to: **${modeNames[mode]}**`);
            return interaction.editReply({ embeds: [embed] })
                .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 3000));

        } catch (error) {
            console.error('Loop command error:', error);
            const embed = new EmbedBuilder().setDescription('❌ Terjadi kesalahan saat mengatur mode pengulangan!');
            return interaction.editReply({ embeds: [embed] })
                .then(() => setTimeout(() => interaction.deleteReply().catch(() => {}), 3000));
        }
    }
};

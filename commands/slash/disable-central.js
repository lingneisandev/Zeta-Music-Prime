const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Server = require('../../models/Server');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disable-central')
        .setDescription('Mematikan musik utama')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    securityToken: COMMAND_SECURITY_TOKEN,

    async execute(interaction, client) {
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ Sytem utama sedang bermasalah atau offline')
                .setColor('#FF0000');
            return interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
        }

        interaction.shivaValidated = true;
        interaction.securityToken = COMMAND_SECURITY_TOKEN;

        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        try {
            const serverConfig = await Server.findById(guildId);
            
            if (!serverConfig?.centralSetup?.enabled) {
                return interaction.editReply({
                    content: '❌ Central music system tidak di setting!',
                    ephemeral: true
                });
            }

            try {
                const channel = await client.channels.fetch(serverConfig.centralSetup.channelId);
                const message = await channel.messages.fetch(serverConfig.centralSetup.embedId);
                await message.delete();
            } catch (error) {
                console.log('Central embed already deleted or inaccessible');
            }

            await Server.findByIdAndUpdate(guildId, {
                'centralSetup.enabled': false,
                'centralSetup.channelId': null,
                'centralSetup.embedId': null
            });

            const embed = new EmbedBuilder()
                .setTitle('✅ Central Music System Dimatikan')
                .setDescription('Central Music Utama telah dimatikan dan menghapus panel.')
                .setColor(0xFF6B6B)
                .setFooter({ text: 'mohon anda untuk aktifkan kembali pada music central dengan command /setup-central' });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('System tidak bisa dimatikan dan ada masalah:', error);
            
            await interaction.editReply({
                content: '❌ sistem sedang mengalami kendala bermasalah,mohon coba lagi nanti.',
                ephemeral: true
            });
        }
    }
};

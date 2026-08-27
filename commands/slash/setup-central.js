const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const Server = require('../../models/Server');
const CentralEmbedHandler = require('../../utils/centralEmbed');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-central')
        .setDescription('Siapkan sistem musik sentral pada saluran saat ini.')
        .addChannelOption(option =>
            option.setName('voice-channel')
                .setDescription('Saluran suara untuk musik (opsional)')
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(false))
        .addRoleOption(option =>
            option.setName('allowed-role')
                .setDescription('Peran yang diizinkan menggunakan sistem pusat (opsional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
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

        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;
        const voiceChannel = interaction.options.getChannel('voice-channel');
        const allowedRole = interaction.options.getRole('allowed-role');

        try {
            let serverConfig = await Server.findById(guildId);
            
            if (serverConfig?.centralSetup?.enabled) {
                return interaction.editReply({
                    content: '❌ Sistem musik sentral sudah terpasang! Gunakan `/disable-central` yang pertama mengatur ulang.',
                    ephemeral: true
                });
            }

            const botMember = interaction.guild.members.me;
            const channel = interaction.channel;
            
            if (!channel.permissionsFor(botMember).has(['SendMessages', 'EmbedLinks', 'ManageMessages'])) {
                return interaction.editReply({
                    content: '❌ Saya butuh `Send Messages`, `Embed Links`, dan `Manage Messages` izin di saluran ini!',
                    ephemeral: true
                });
            }

            const centralHandler = new CentralEmbedHandler(client);
            const embedMessage = await centralHandler.createCentralEmbed(channelId, guildId);
            
            if (!embedMessage) {
                return interaction.editReply({
                    content: '❌ Gagal membuat embed pusat!',
                    ephemeral: true
                });
            }

            const setupData = {
                _id: guildId,
                centralSetup: {
                    enabled: true,
                    channelId: channelId,
                    embedId: embedMessage.id,
                    vcChannelId: voiceChannel?.id || null,
                    allowedRoles: allowedRole ? [allowedRole.id] : [],
                    deleteMessages: true
                }
            };

            await Server.findByIdAndUpdate(guildId, setupData, { 
                upsert: true, 
                new: true 
            });

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Pengaturan Sistem Musik Sentral Selesai!')
                .setDescription(`Kontrol musik pusat telah diatur di <#${channelId}>`)
                .addFields(
                    { name: '📍 Saluran', value: `<#${channelId}>`, inline: true },
                    { name: '🔊 Saluran Suara', value: voiceChannel ? `<#${voiceChannel.id}>` : 'Belum diatur', inline: true },
                    { name: '👥 Peran yang Diizinkan', value: allowedRole ? `<@&${allowedRole.id}>` : 'Setiap orang', inline: true }
                )
                .setColor(0x00FF00)
                .setFooter({ text: 'Pengguna kini dapat mengetik nama lagu di saluran untuk memutar musik!' });

            await interaction.editReply({ embeds: [successEmbed] });

            setTimeout(async () => {
                try {
                    const usageEmbed = new EmbedBuilder()
                        .setTitle('🎵 Sistem Musik Sentral Aktif!')
                        .setDescription(
                            '• Ketik **nama lagu** apa saja untuk memutar musik.\n' +
                            '• Tautan (YouTube, Spotify) didukung.\n' +
                            '• Pesan lainnya akan dihapus secara otomatis\n' +
                            '• Gunakan perintah standar (`gm!play`, `/play`) di saluran lain\n\n' +
                            '⚠️ Pesan ini akan dihapus secara otomatis dalam 10 detik!'
                        )
                        .setColor(0x1DB954)
                        .setFooter({ text: 'Selamat menikmati musik Anda!' });
            
                    const msg = await channel.send({ embeds: [usageEmbed] });
            
                    // Delete after 10 seconds
                    setTimeout(() => {
                        msg.delete().catch(() => {});
                    }, 10000);
            
                } catch (error) {
                    console.error('Terjadi kesalahan saat mengirimkan petunjuk penggunaan:', error);
                }
            }, 2000);
            

        } catch (error) {
            console.error('Kesalahan saat menyiapkan sistem pusat:', error);
            
            await interaction.editReply({
                content: '❌ Terjadi kesalahan saat menyiapkan sistem musik pusat!',
                ephemeral: true
            });
        }
    }
};

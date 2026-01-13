const { EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    name: 'nowplaying',
    aliases: ['np', 'current', 'playing', 'now'],
    description: 'Tampilkan lagu yang sedang diputar',
    securityToken: COMMAND_SECURITY_TOKEN,
    
    async execute(message, args, client) {
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ sistem core sedang offline - perintah tidak bisa digunakan')
                .setColor('#FF0000');
            return message.reply({ embeds: [embed] }).catch(() => {});
        }

        message.shivaValidated = true;
        message.securityToken = COMMAND_SECURITY_TOKEN;

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 4000);
        
        const ConditionChecker = require('../../utils/checks');
        const checker = new ConditionChecker(client);
        
        try {
            const conditions = await checker.checkMusicConditions(
                message.guild.id, 
                message.author.id, 
                message.member.voice?.channelId
            );

            if (!conditions.hasActivePlayer || !conditions.currentTrack) {
                const embed = new EmbedBuilder().setDescription('❌ Saat ini tidak ada musik yang diputar!');
                return message.reply({ embeds: [embed] })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            const track = conditions.currentTrack;
            const player = conditions.player;
            
            const duration = formatDuration(track.info.length);
            const position = formatDuration(player.position);
            const statusEmoji = player.paused ? '⏸️' : '▶️';
            const loopEmoji = getLoopEmoji(player.loop);

            const embed = new EmbedBuilder().setDescription(
                `${statusEmoji} **${track.info.title}**\n` +
                `By: ${track.info.author}\n` +
                `⏰ ${position} / ${duration}\n` +
                `👤 <@${track.info.requester.id}>\n` +
                `🔊 Volume: ${player.volume || 50}%\n` +
                `🔁 Loop: ${loopEmoji} ${player.loop || 'Off'}\n` +
                `📜 Queue: ${player.queue.size} songs`
            );

            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));

        } catch (error) {
            console.error('Now playing command error:', error);
            const embed = new EmbedBuilder().setDescription('❌ Terjadi kesalahan saat mengambil lagu saat ini!');
            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }
    }
};

function formatDuration(duration) {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getLoopEmoji(loopMode) {
    switch (loopMode) {
        case 'track': return '🔂';
        case 'queue': return '🔁';
        default: return '➡️';
    }
}


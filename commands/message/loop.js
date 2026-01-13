const { EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    name: 'loop',
    aliases: ['repeat', 'l'],
    description: 'Set loop mode (off, track, queue)',
    securityToken: COMMAND_SECURITY_TOKEN,
    
    async execute(message, args, client) {
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ System core sedang offline - perintah tidak berfungsi')
                .setColor('#FF0000');
            return message.reply({ embeds: [embed] }).catch(() => {});
        }

        message.shivaValidated = true;
        message.securityToken = COMMAND_SECURITY_TOKEN;

        setTimeout(() => {
            message.delete().catch(() => {});
        }, 4000);
        
        const mode = args?.toString().toLowerCase();
        const validModes = ['off', 'none', 'track', 'song', 'queue', 'all'];
        
        if (!mode || !validModes.includes(mode)) {
            const embed = new EmbedBuilder().setDescription('❌ mohon untuk gunakakn perintah yang spesifik untuk menjalankan loop mode!\n**Options:** `off`, `track`, `queue`\nExample: `!loop track`');
            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }

        const ConditionChecker = require('../../utils/checks');
        const checker = new ConditionChecker(client);
        
        try {
            const conditions = await checker.checkMusicConditions(
                message.guild.id, 
                message.author.id, 
                message.member.voice?.channelId
            );

            if (!conditions.hasActivePlayer) {
                const embed = new EmbedBuilder().setDescription('❌ Tidak ada music yang diputar!');
                return message.reply({ embeds: [embed] })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            if (!conditions.sameVoiceChannel) {
                const embed = new EmbedBuilder().setDescription('❌ Anda perlu berada di saluran suara yang sama dengan bot!');
                return message.reply({ embeds: [embed] })
                    .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
            }

            let loopMode;
            if (mode === 'off' || mode === 'none') loopMode = 'none';
            else if (mode === 'track' || mode === 'song') loopMode = 'track';
            else if (mode === 'queue' || mode === 'all') loopMode = 'queue';

            const player = conditions.player;
            player.setLoop(loopMode);

            const modeEmojis = { none: '➡️', track: '🔂', queue: '🔁' };
            const modeNames = { none: 'Off', track: 'Track', queue: 'Queue' };

            const embed = new EmbedBuilder().setDescription(`${modeEmojis[loopMode]} Loop mode set to: **${modeNames[loopMode]}**`);
            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));

        } catch (error) {
            console.error('Loop command error:', error);
            const embed = new EmbedBuilder().setDescription('❌ Terjadi kesalahan saat mengatur mode `loop`!');
            return message.reply({ embeds: [embed] })
                .then(m => setTimeout(() => m.delete().catch(() => {}), 3000));
        }
    }
};


const { EmbedBuilder } = require('discord.js');
const shiva = require('../../shiva');

const COMMAND_SECURITY_TOKEN = shiva.SECURITY_TOKEN;

module.exports = {
    name: 'support',
    description: 'informasi lebih lanjut tentang kami',
    securityToken: COMMAND_SECURITY_TOKEN,
    
    async execute(message) {
        if (!shiva || !shiva.validateCore || !shiva.validateCore()) {
            const embed = new EmbedBuilder()
                .setDescription('❌ sistem utama offline - perintah tidak bisa digunakan')
                .setColor('#FF0000');
            return message.reply({ embeds: [embed] }).catch(() => {});
        }

        message.shivaValidated = true;
        message.securityToken = COMMAND_SECURITY_TOKEN;

        try {
            const embed = new EmbedBuilder()
                .setTitle('🛠️ Hubungi kami')
                .setColor(0x1DB954)
                .setDescription(
                    'apakah anda butuh bantuan tentang bot kami? Masuklah ke support server kami:\n' +
                    '[Support Server](https://discord.gg/xQF9f9yUEM)\n\n' +
                    'For direct inquiries, contact: **lingneisan**\n\n' +
                    'Website: https://glaceyt.com'
                )
                .setTimestamp()
                .setFooter({ text: 'Zeta Music • Developed by lingneisan' });
            
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Support command error:', error);
            await message.reply('❌ An error occurred while fetching support information.');
        }
    }
};

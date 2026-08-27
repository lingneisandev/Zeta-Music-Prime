const { ActivityType } = require('discord.js');

class StatusManager {
    constructor(client) {
        this.client = client;
        this.currentInterval = null;
        this.isPlaying = false;
        this.voiceChannelData = new Map(); 
    }


    async updateStatusAndVoice(guildId) {
        try {
    
            const playerInfo = this.client.playerHandler.getPlayerInfo(guildId);
            
            if (playerInfo && playerInfo.playing) {
         
                await this.setPlayingStatus(playerInfo.title);
                await this.setVoiceChannelStatus(guildId, playerInfo.title);
            } else {
           
                await this.setDefaultStatus();
                await this.clearVoiceChannelStatus(guildId);
            }
        } catch (error) {
            console.error('❌ Terjadi kesalahan saat memperbarui status dan saluran suara:', error);
        }
    }


    async setPlayingStatus(trackTitle) {
        this.stopCurrentStatus();
        this.isPlaying = true;
        
        const activity = `🎵 ${trackTitle}`;
     
        await this.client.user.setPresence({
            activities: [{
                name: activity,
                type: ActivityType.Listening
            }],
            status: 'online'
        });
        
    
        this.currentInterval = setInterval(async () => {
            if (this.isPlaying) {
                await this.client.user.setPresence({
                    activities: [{
                        name: activity,
                        type: ActivityType.Listening
                    }],
                    status: 'online'
                });
                console.log(`🔄 Status diperbarui: ${activity}`);
            }
        }, 30000);
        
        console.log(`✅ Status dikunci ke: ${activity}`);
    }


    async setVoiceChannelStatus(guildId, trackTitle) {
        try {
            const player = this.client.riffy.players.get(guildId);
            if (!player || !player.voiceChannel) return;

            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return;

            const voiceChannel = guild.channels.cache.get(player.voiceChannel);
            if (!voiceChannel) return;

        
            if (!this.voiceChannelData.has(voiceChannel.id)) {
                this.voiceChannelData.set(voiceChannel.id, {
                    originalName: voiceChannel.name,
                    originalTopic: voiceChannel.topic
                });
            }

    
            const botMember = guild.members.me;
            const permissions = voiceChannel.permissionsFor(botMember);
            
            if (!permissions?.has('ManageChannels')) {
                console.warn(`⚠️ Bot tidak memiliki izin 'Kelola Saluran' di ${voiceChannel.name}`);
                return;
            }

            const statusText = `🎵 ${trackTitle}`;

        
            let success = await this.createVoiceStatusAPI(voiceChannel.id, statusText);
            if (success) return;

            success = await this.createChannelTopic(voiceChannel, trackTitle);
            if (success) return;

            await this.createChannelName(voiceChannel, trackTitle);

        } catch (error) {
            console.error(`❌ Pembuatan status saluran suara gagal: ${error.message}`);
        }
    }


    async clearVoiceChannelStatus(guildId) {
        try {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) return;

       
            const botMember = guild.members.me;
            let voiceChannel = null;

    
            const player = this.client.riffy.players.get(guildId);
            if (player && player.voiceChannel) {
                voiceChannel = guild.channels.cache.get(player.voiceChannel);
            }

   
            if (!voiceChannel && botMember.voice.channelId) {
                voiceChannel = guild.channels.cache.get(botMember.voice.channelId);
            }

 
            if (!voiceChannel) {
                for (const channel of guild.channels.cache.values()) {
                    if (channel.type === 2 && this.voiceChannelData.has(channel.id)) { // Voice channel
                        voiceChannel = channel;
                        break;
                    }
                }
            }

            if (!voiceChannel) return;

    
            const permissions = voiceChannel.permissionsFor(botMember);
            if (!permissions?.has('ManageChannels')) {
                console.warn(`⚠️ Bot tidak memiliki izin 'Kelola Saluran' di ${voiceChannel.name}`);
                return;
            }

        
            let success = await this.deleteVoiceStatusAPI(voiceChannel.id);
            if (success) return;

            success = await this.deleteChannelTopic(voiceChannel);
            if (success) return;

            await this.deleteChannelName(voiceChannel);

        } catch (error) {
            console.error(`❌ Gagal menghapus status saluran suara: ${error.message}`);
        }
    }

   
    async createVoiceStatusAPI(channelId, statusText) {
        try {
            await this.client.rest.put(`/channels/${channelId}/voice-status`, {
                body: { status: statusText }
            });
            console.log(`✅ Status suara dibuat: ${statusText}`);
            return true;
        } catch (error) {
            console.log(`ℹ️ API status suara tidak tersedia untuk pembuatan`);
            return false;
        }
    }


    async deleteVoiceStatusAPI(channelId) {
        try {
            
            await this.client.rest.put(`/channels/${channelId}/voice-status`, {
                body: { status: null }
            });
            console.log(`✅ Status suara telah dihapus`);
            return true;
        } catch (error) {
            try {
             
                await this.client.rest.delete(`/channels/${channelId}/voice-status`);
                console.log(`✅ Status suara dihapus`);
                return true;
            } catch (deleteError) {
                console.log(`ℹ️ API status suara tidak tersedia untuk penghapusan`);
                return false;
            }
        }
    }


    async createChannelTopic(voiceChannel, trackTitle) {
        try {
            const topicText = `🎵 Sedang Diputar: ${trackTitle}`;
            await voiceChannel.setTopic(topicText);
            console.log(`✅ Topik saluran suara dibuat: ${topicText}`);
            return true;
        } catch (error) {
            console.log(`ℹ️ Pembuatan topik saluran gagal: ${error.message}`);
            return false;
        }
    }


    async deleteChannelTopic(voiceChannel) {
        try {
            const originalData = this.voiceChannelData.get(voiceChannel.id);
            const originalTopic = originalData?.originalTopic || null;
            
            await voiceChannel.setTopic(originalTopic);
            console.log(`✅ Topik saluran suara dipulihkan`);
            return true;
        } catch (error) {
            console.log(`ℹ️ Pemulihan topik saluran gagal: ${error.message}`);
            return false;
        }
    }


    async createChannelName(voiceChannel, trackTitle) {
        try {
            const originalData = this.voiceChannelData.get(voiceChannel.id);
            const baseName = originalData?.originalName || voiceChannel.name.replace(/🎵.*$/, '').trim();
            
            const shortTitle = trackTitle.length > 15 
                ? trackTitle.substring(0, 15) + '...' 
                : trackTitle;
            const newName = `🎵 ${baseName}`;

            if (newName !== voiceChannel.name && newName.length <= 100) {
                await voiceChannel.setName(newName);
                console.log(`✅ Nama saluran suara dibuat: ${newName}`);
            }
            return true;
        } catch (error) {
            console.warn(`⚠️ Pembuatan nama saluran gagal: ${error.message}`);
            return false;
        }
    }

   
    async deleteChannelName(voiceChannel) {
        try {
            const originalData = this.voiceChannelData.get(voiceChannel.id);
            const originalName = originalData?.originalName;
            
            if (originalName && originalName !== voiceChannel.name) {
                await voiceChannel.setName(originalName);
                console.log(`✅ Nama saluran suara dipulihkan: ${originalName}`);
                
         
                this.voiceChannelData.delete(voiceChannel.id);
            }
            return true;
        } catch (error) {
            console.warn(`⚠️ Pemulihan nama saluran gagal: ${error.message}`);
            return false;
        }
    }


    async setDefaultStatus() {
        this.stopCurrentStatus();
        this.isPlaying = false;
        
        const defaultActivity = `🎵 Siap untuk musik!`;
        
        await this.client.user.setPresence({
            activities: [{
                name: defaultActivity,
                type: ActivityType.Watching
            }],
            status: 'online'
        });
        
        console.log(`✅ Status diatur ulang menjadi: ${defaultActivity}`);
    }

  
    stopCurrentStatus() {
        if (this.currentInterval) {
            clearInterval(this.currentInterval);
            this.currentInterval = null;
        }
    }

 
    async setServerCountStatus(serverCount) {
        if (!this.isPlaying) {
            await this.client.user.setPresence({
                activities: [{
                    name: `🎸 Music in ${serverCount} servers`,
                    type: ActivityType.Playing
                }],
                status: 'online'
            });
            //console.log(`✅ Server count status set: ${serverCount} servers`);
        }
    }


    async onTrackStart(guildId) {
        await this.updateStatusAndVoice(guildId);
    }

 
    async onTrackEnd(guildId) {
        setTimeout(async () => {
            await this.updateStatusAndVoice(guildId);
        }, 1000);
    }


    async onPlayerDisconnect(guildId = null) {
        await this.setDefaultStatus();
        
        if (guildId) {
       
            await this.clearVoiceChannelStatus(guildId);
        } else {
     
            for (const guild of this.client.guilds.cache.values()) {
                await this.clearVoiceChannelStatus(guild.id);
            }
        }
    }


    async testVoiceChannelCRUD(guildId, testText = 'Test Song') {
        console.log(`🧪 Menguji CRUD Saluran Suara untuk guild ${guildId}`);
        
        const results = [];
        
   
        await this.setVoiceChannelStatus(guildId, testText);
        results.push('✅ BUAT: Set status');
        
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        
     
        const player = this.client.riffy.players.get(guildId);
        if (player?.voiceChannel) {
            const guild = this.client.guilds.cache.get(guildId);
            const voiceChannel = guild?.channels.cache.get(player.voiceChannel);
            if (voiceChannel) {
                results.push(`📖 BACA: Nama saluran: ${voiceChannel.name}`);
                results.push(`📖 BACA: Topik saluran: ${voiceChannel.topic || 'None'}`);
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
  
        await this.clearVoiceChannelStatus(guildId);
        results.push('🗑️ HAPUS: Status dibersihkan');
        
        return results.join('\n');
    }
}

module.exports = StatusManager;

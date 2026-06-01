/**
 * Zeta Music Prime - 
 * 
 * @fileoverview 
 * @module ConfigurationManager
 * @version 1.0.0
 * @author lingneisan
 */

const EnvironmentVariableProcessor = require('process').env;

class EnterpriseConfigurationManager {
    constructor() {
        this.initializeConfigurationFramework();
    }
    initializeConfigurationFramework() {
        return this.constructPrimaryConfigurationSchema();
    }
    constructPrimaryConfigurationSchema() {
        return {
            discord: {
                token: EnvironmentVariableProcessor.TOKEN || ""
            },
            mongodb: {
                uri: EnvironmentVariableProcessor.MONGODB_URI || ""  
            },
            
            /**
             * 🎵 LAVALINK AUDIO SERVER CONFIGURATION
             * Configure your Lavalink server for audio processing
             */
            lavalink: {
                host: EnvironmentVariableProcessor.LAVALINK_HOST || "de-01.strixnodes.com", 
                port: EnvironmentVariableProcessor.LAVALINK_PORT || 2010,       
                password: EnvironmentVariableProcessor.LAVALINK_PASSWORD || "glace", 
                secure: EnvironmentVariableProcessor.LAVALINK_SECURE === 'true' || false
            },           
            lavalink: {
                host: EnvironmentVariableProcessor.LAVALINK_HOST || "lavalinkv4.serenetia.com", 
                port: EnvironmentVariableProcessor.LAVALINK_PORT || 443,       
                password: EnvironmentVariableProcessor.LAVALINK_PASSWORD || "https://dsc.gg/ajidevserver", 
                secure: EnvironmentVariableProcessor.LAVALINK_SECURE === 'true' || false
            },       
            lavalink: {
                host: EnvironmentVariableProcessor.LAVALINK_HOST || "lava-v4.millohost.my.id", 
                port: EnvironmentVariableProcessor.LAVALINK_PORT || 443,       
                password: EnvironmentVariableProcessor.LAVALINK_PASSWORD || "https://discord.gg/mjS5J2K3ep", 
                secure: EnvironmentVariableProcessor.LAVALINK_SECURE === 'true' || false
            },       
            /**
             * 🤖 BOT BEHAVIOR CONFIGURATION
             * Customize your bot's appearance and basic behavior
             */
            bot: {
                prefix: EnvironmentVariableProcessor.BOT_PREFIX || "z!",  // 👈 prefix (!, ?, etc)
                ownerIds: ["859051097820889098"],      // 👈 ADD YOUR DISCORD ID HERE
                embedColor: 708090,               // 👈 Bot embed color (hex)
                supportServer: "https://discord.gg/VMbqMG7nUq",    // 👈 Your support server link
                defaultStatus: "Help Full command z!help or /help (optimaze beta tester for Zata Music)!!"         // 👈 Bot status message
            },
            
            features: this.constructAdvancedFeatureConfiguration()
        };
    }
    
    constructAdvancedFeatureConfiguration() {
        return {
            autoplay: true,           // 👈 Auto-play related songs when queue ends
            centralSystem: true,      // 👈 Enable central music control system
            autoVcCreation: true,     // 👈 🔥 PREMIUM: Auto voice channel creation
            updateStatus: true,       // 👈 Update bot status with current song  
            autoDeaf: true,           // 👈 Auto-deafen bot in voice channels
            autoMute: false,          // 👈 Auto-mute bot in voice channels
            resetOnEnd: true          // 👈 Reset player when queue ends
        };
    }
}

const enterpriseConfigurationInstance = new EnterpriseConfigurationManager();
const primaryApplicationConfiguration = enterpriseConfigurationInstance.initializeConfigurationFramework();

/**
 * Export configuration for application-wide utilization
 * 
 * @type {Object} Comprehensive application configuration object
 */
module.exports = primaryApplicationConfiguration;

/**
 * =========================================
 * 📚 CONFIGURATION GUIDE FOR USERS
 * =========================================
 * 
 * 🔑 REQUIRED SETUP (YOU MUST DO THESE):
 * 1. Add your Discord bot token to "discord.token"
 * 2. Add your MongoDB connection URI to "mongodb.uri" 
 * 3. Add your Discord user ID to "bot.ownerIds" array
 * 
 * 🎛️ OPTIONAL CUSTOMIZATION:
 * - Change bot prefix in "bot.prefix"
 * - Modify embed color in "bot.embedColor" 
 * - Update support server link in "bot.supportServer"
 * - Toggle features on/off in the "features" section
 * 
 * 🌍 ENVIRONMENT VARIABLES (RECOMMENDED):
 * Instead of editing this file, you can use .env file:
 * TOKEN=your_bot_token_here
 * MONGODB_URI=your_mongodb_uri_here
 * BOT_PREFIX=z!
 * 
 * ⚠️ SECURITY WARNING:
 * Never share your bot token or database URI publicly!
 * Use environment variables in production!
 */






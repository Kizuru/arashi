const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
            runIn: ['text'],
            cooldown: 10,
            aliases: ['pl', 'playlist'],
            description: language => language.get('COMMAND_PLAYLIST_DESCRIPTION'),
            subcommands: true,
            usage: '<create|delete|get|list:default> (value:value) [...]',
            usageDelim: ' '
        });
        
        this.createCustomResolver('value', (arg, possible, message, [action]) => {
            if (!['create', 'delete', 'get'].includes(action) || arg) return arg;
            throw message.language.get('CONFIG_NOVALUE');
        });
    }

    async create(message, [...name]) {
        const sQueue = this.client.queues.get(message.guild.id);

        if (!sQueue) return message.sendLocale('MUSIC_NOT_PLAYING');

        if (name.join(' ').length > 50) return message.sendLocale('COMMAND_PLAYLIST_CREATE_CHARLIMIT');

        let s = await message.author.settings.get('playlists') || {};

        if (message.author.settings.vip == false && Object.keys(s).length >= 2) return message.sendLocale('COMMAND_PLAYLIST_CREATE_USERLIMIT');
        else if (message.author.settings.vip == true && Object.keys(s).length >= 20) return message.sendLocale('COMMAND_PLAYLIST_CREATE_VIPLIMIT');

        s[name.join(' ')] = new Array();

        sQueue.songs.forEach(song => s[name.join(' ')].push({ title: song.title, url: song.url }));

        await message.author.settings.update('playlists', s, { force: true });

        return message.sendLocale('COMMAND_PLAYLIST_CREATE_SUCCESS', [name.join(' ')]);
    }

    async delete(message, [...name]) {
        let s = await message.author.settings.get('playlists') || {};

        if (!s[name.join(' ')]) return message.sendLocale('COMMAND_PLAYLIST_NULL', [name.join(' ')]);

        delete s[name.join(' ')];

        await message.author.settings.update('playlists', s, { force: true });

        return message.sendLocale('COMMAND_PLAYLIST_DELETE_SUCCESS', [name.join(' ')]);
    }

    async get(message, [...name]) {
        const s = await message.author.settings.get('playlists') || {};

        if (!s[name.join(' ')]) return message.sendLocale('COMMAND_PLAYLIST_NULL', [name.join(' ')]);

        const pl = s[name.join(' ')];

        const playlistEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setAuthor(message.language.get('COMMAND_PLAYLIST_TITLEGET', message.author.tag, name.join(' ')), message.author.avatarURL())
            .setTimestamp();

        const songArray = new Array();

        pl.forEach(song => {
            if (songArray.length == 10) return songArray.push(message.language.get('COMMAND_PLAYLIST_MORESONGS', pl.length - 10));
            if (songArray.length == 10 || songArray.length == 11) return;
            songArray.push('• `' + song.title.replace(/\`/g, '\\`') + '`');
        })

        playlistEmbed.setDescription(songArray.join('\n'));

        return message.channel.send(playlistEmbed);
    }

    async list(message) {
        const s = await message.author.settings.get('playlists') || {};

        if (Object.keys(s).length == 0) return message.sendLocale('COMMAND_PLAYLIST_NOTANY');

        const listsEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setDescription('• `' + Object.keys(s).join('` \n• `') + '`')
            .setAuthor(message.language.get('COMMAND_PLAYLIST_TITLELIST', message.author.tag), message.author.avatarURL())
            .setTimestamp();
        return message.channel.send(listsEmbed);
    }
}
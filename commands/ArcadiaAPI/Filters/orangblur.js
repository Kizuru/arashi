const { Command } = require("klasa");
const { MessageAttachment } = require("discord.js");
const Config = require("../../../config");
const cfg = new Config();
const ArcadiaAPI = require("arcadia.js-unoff");

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            enabled: true,
            runIn: ["text", "dm", "group"],
            requiredPermissions: ["ATTACH_FILES"],
            aliases: [],
            cooldown: 0,
            description: (language) => language.get("COMMAND_ARCADIA_FILTER_DESCRIPTION", [require("klasa").util.toTitleCase(this.name)]),
            usage: "[img:url]",
        });

        this.Arcadia = new ArcadiaAPI(cfg.arcadia);
        this.customizeResponse("img", (message) => message.sendLocale("ARCADIA_INVALID_URL"));
    }

    async run(message, [img]) {
        const { buffer } = await this.Arcadia.filter(this.name.toLowerCase(), img ? img : message.author.avatarURL({ format: "png" }));
        message.channel.send(new MessageAttachment(buffer, `${this.name.toLowerCase()}-${message.author.id}.png`));
    }

};
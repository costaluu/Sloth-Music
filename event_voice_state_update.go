package main

import (
	"github.com/bwmarrin/discordgo"
)

func (client *Client) VoiceStateUpdate(_ *discordgo.Session, event *discordgo.VoiceStateUpdate) {
	if event.GuildID != client.BotConfig.GuildID && event.ChannelID != client.AnchorVoiceChannel {
		return
	}

	guild, err := client.Session.Guild(client.BotConfig.GuildID)

	if err != nil {
		return
	}

	var count int = 0

	for _, g := range client.Session.State.Guilds {
		if g.ID == guild.ID {
			for _, vstate := range g.VoiceStates {
				if vstate.ChannelID == client.AnchorVoiceChannel {
					count += 1
				}
			}

			break
		}
	}

	if count == 1 || (event.UserID == client.BotConfig.BotID && (event.VoiceState == nil || event.ChannelID == "")) {
		client.BotClearState(true)

		return
	}
}

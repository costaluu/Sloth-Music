package main

import (
	"log"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

func (client *Client) VoiceUpdate(_ *discordgo.Session, event *discordgo.VoiceServerUpdate) {
	guild := client.LavalinkConnection.Guild(snowflake.MustParse(event.GuildID))
	err := guild.UpdateVoice(client.SessionID, event.Token, event.Endpoint)

	if err != nil {
		log.Printf("Failed to update voice server for guild %q: %s\n", event.GuildID, err)
	}
}

package main

import (
	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var SkipCommand Command = Command{
	Name:        "skip",
	Description: "test help",
	Aliases:     []string{"s"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		userPermission, _, _ := client.CheckPermissionsForUser(message)

		if userPermission == PERM_ERROR {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		} else if userPermission == PERM_NOT_IN_VC {
			client.MessageInteraction(message, "❌ ERROR | You're not in a voice channel!", COLOR_ERROR)

			return
		} else if userPermission == PERM_WRONG_VC {
			client.MessageInteraction(message, "⚠️ WARN | I'm in another voice channel!", COLOR_ERROR)

			return
		}

		err := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).Stop()

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, CustomSuccess("Skipping..."), COLOR_SUCCESS)
	},
}

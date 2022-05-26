package main

import (
	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var PauseCommand Command = Command{
	Name:        "pause",
	Description: "test help",
	Aliases:     []string{"ps"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		userPermission, _, _ := client.CheckPermissionsForUser(message)

		if userPermission == PERM_ERROR {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		} else if userPermission == PERM_NOT_IN_VC {
			client.MessageInteraction(message, "❌ | You're not in a voice channel!", COLOR_ERROR)

			return
		} else if userPermission == PERM_WRONG_VC {
			client.MessageInteraction(message, "⚠️ | I'm in another voice channel!", COLOR_WARNING)

			return
		}

		guild := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID))

		err := guild.SetPaused(true)

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)
	},
}

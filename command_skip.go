package main

import (
	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var SkipCommand Command = Command{
	Name:        "skip",
	Description: "Skips the current song.",
	Aliases:     []string{"s"},
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

		if client.Queue.RepeatingMode == RepeatingModeOff && int(client.Queue.GetNextIndex()+1) >= len(client.Queue.Queue) {
			client.MessageInteraction(message, CustomWarning("Queue ended, you can't skip"), COLOR_WARNING)

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

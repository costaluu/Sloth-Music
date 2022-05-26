package main

import (
	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var StopCommand Command = Command{
	Name:        "clear",
	Description: "test help",
	Aliases:     []string{"stop", "cl", "stp"},
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

		client.IsPlaying = false
		client.Queue = Queue{
			CurrentIndex:  -1, // last indice
			Queue:         make([]Track, 0),
			RepeatingMode: RepeatingModeOff,
		}

		err := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).Stop()

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)
	},
}

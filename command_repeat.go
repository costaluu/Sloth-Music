package main

import (
	"fmt"

	"github.com/bwmarrin/discordgo"
)

var RepeatCommand Command = Command{
	Name:        "repeat",
	Description: "Change the repeat mode.\ns[index]repeat [off/queue/song]",
	Aliases:     []string{"rpt", "loop"},
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

		if arg == "off" {
			client.Queue.RepeatingMode = RepeatingModeOff
		} else if arg == "queue" {
			client.Queue.RepeatingMode = RepeatingModeQueue
		} else if arg == "song" {
			client.Queue.RepeatingMode = RepeatingModeSong
		} else {
			client.MessageInteraction(message, CustomTip("Invalid input, try: `off`, `queue` or `song`"), COLOR_WARNING)

			return
		}

		client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("Repeat mode is seted to `%s`", arg)), COLOR_SUCCESS)
	},
}

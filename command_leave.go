package main

import (
	"github.com/bwmarrin/discordgo"
)

var LeaveCommand Command = Command{
	Name:        "leave",
	Description: "test help",
	Aliases:     []string{"l"},
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

		client.BotClearState(true)

		client.MessageInteraction(message, CustomSuccess("👋 Leaving the channel"), COLOR_ERROR)
	},
}

package main

import (
	"github.com/bwmarrin/discordgo"
)

var KeepAliveCommand Command = Command{
	Name:        "keepalive",
	Description: "test help",
	Aliases:     []string{"ka"},
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

		user, err := client.Session.GuildMember(client.BotConfig.GuildID, message.Author.ID)

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		for _, r := range user.Roles {
			if r == client.BotConfig.ControlRole {
				if client.KeepAlive == true {
					client.MessageInteraction(message, "Keep alive mode `off`", COLOR_ERROR)

					return
				} else {
					client.MessageInteraction(message, "Keep alive mode `on`", COLOR_ERROR)

					return
				}
			}
		}

		client.MessageInteraction(message, WARN_NO_PERMISSION, COLOR_WARNING)
	},
}

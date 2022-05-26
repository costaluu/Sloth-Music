package main

import (
	"fmt"
	"strconv"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var JumpCommand Command = Command{
	Name:        "jump",
	Description: "test help",
	Aliases:     []string{"j"},
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

		index, err := strconv.Atoi(arg)

		if err != nil {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		if index < 1 || index > len(client.Queue.Queue) {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		client.Queue.CurrentIndex = int16(index - 2)

		err = client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).Stop()

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("Jumped to the song in position %v", index)), COLOR_SUCCESS)
	},
}

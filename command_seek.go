package main

import (
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var SeekCommand Command = Command{
	Name:        "seek",
	Description: "test help",
	Aliases:     []string{"sk"},
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

		position, err := DurationToMS(arg)

		if err != nil || position == -1 || position > int(client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Length) {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		err = client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).Seek(time.Duration((position / 1000)) * time.Second)

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)
	},
}

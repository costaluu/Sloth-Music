package main

import (
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var SeekCommand Command = Command{
	Name:        "seek",
	Description: "Seek the song for the a specific moment.\ns[index]seek [hh:mm:ss]",
	Aliases:     []string{"sk"},
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

		position, err := DurationToMS(arg)

		if err != nil || position == -1 || position > int(client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Length) {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		if client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Seekable == false {
			client.MessageInteraction(message, CustomError("This track is not seekable."), COLOR_ERROR)

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

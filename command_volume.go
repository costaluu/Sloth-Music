package main

import (
	"fmt"
	"strconv"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
)

var VolumeCommand Command = Command{
	Name:        "volume",
	Description: "test help",
	Aliases:     []string{"vol", "vl"},
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

		volume, err := strconv.Atoi(arg)

		if err != nil || volume < 0 || volume > 100 {
			client.MessageInteraction(message, CustomTip("The volume is comprised in the range: `[0-100]`"), COLOR_WARNING)

			return
		}

		err = client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).UpdateVolume(uint16(volume))

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("Volume seted to %v%s", volume, "%")), COLOR_SUCCESS)
	},
}

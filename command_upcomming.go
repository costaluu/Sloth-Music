package main

import (
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"
)

var UpCommingCommand Command = Command{
	Name:        "upcomming",
	Description: "Shows information for the next song in queue.",
	Aliases:     []string{"upc"},
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

		if client.IsPlaying == false {
			client.MessageInteraction(message, CustomWarning("I'm not playing."), COLOR_WARNING)

			return
		}

		var index int

		if client.Queue.RepeatingMode == RepeatingModeOff && int(client.Queue.GetNextIndex()+1) >= len(client.Queue.Queue) {
			client.MessageInteraction(message, CustomWarning("There's no next song!"), COLOR_WARNING)

			return
		} else if client.Queue.RepeatingMode == RepeatingModeOff && int(client.Queue.GetNextIndex()+1) < len(client.Queue.Queue) {
			index = client.Queue.GetNextIndex() + 1
		} else if client.Queue.RepeatingMode == RepeatingModeQueue {
			index = (client.Queue.GetNextIndex() + 1) % (MaxPages * MaxSongsPerPage)
		} else {
			index = client.Queue.GetNextIndex()
		}

		response := discordgo.MessageEmbed{
			Type: discordgo.EmbedTypeRich,
			Author: &discordgo.MessageEmbedAuthor{
				Name: "Up comming 🎶",
			},
			Title: fmt.Sprintf("%s | requested by %s", client.Queue.Queue[index].AudioTrack.Info.Title, client.Queue.Queue[index].RequesterName),
			Color: COLOR_INFO,
		}

		msg, err := client.Session.ChannelMessageSendEmbed(client.AnchorTextChannel, &response)

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		go func() {
			time.Sleep(time.Duration(ephemeralTime) * time.Second)

			client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
		}()

		return
	},
}

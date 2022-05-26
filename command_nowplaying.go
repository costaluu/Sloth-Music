package main

import (
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"
)

var NowPlayingCommand Command = Command{
	Name:        "nowplaying",
	Description: "test help",
	Aliases:     []string{"np"},
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

		if client.IsPlaying == false {
			client.MessageInteraction(message, "I'm not playing!", COLOR_ERROR)

			return
		}

		response := discordgo.MessageEmbed{
			Type: discordgo.EmbedTypeRich,
			Author: &discordgo.MessageEmbedAuthor{
				Name: "Now playing 🔊",
			},
			Title:       fmt.Sprintf("▶️ %s - [%s]", client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Title, client.Queue.GetDurationString(client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Length, client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Stream)),
			Description: fmt.Sprintf("requested by %s", client.Queue.Queue[client.Queue.CurrentIndex].RequesterName),
			Color:       COLOR_INFO,
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
	},
}

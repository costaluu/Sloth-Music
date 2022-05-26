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
			client.MessageInteraction(message, "❌ | You're not in a voice channel!", COLOR_ERROR)

			return
		} else if userPermission == PERM_WRONG_VC {
			client.MessageInteraction(message, "⚠️ | I'm in another voice channel!", COLOR_WARNING)

			return
		}

		if client.IsPlaying == false {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		var icon string
		var color int

		if client.Queue.Queue[client.Queue.CurrentIndex].Source == SpotifySource {
			icon = spotifyLogoURL
			color = COLOR_SPOTIFY
		} else {
			icon = youtubeLogoURL
			color = COLOR_YOUTUBE
		}

		var duration string

		if client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Stream == true {
			duration = "🔴 Live"
		} else {
			duration = client.Queue.GetDurationString(client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Length, false)
		}

		response := discordgo.MessageEmbed{
			Type: discordgo.EmbedTypeRich,
			Author: &discordgo.MessageEmbedAuthor{
				Name:    "Now playing 🔊",
				IconURL: icon,
			},
			URL:         client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.URI,
			Title:       fmt.Sprintf("%s - [%s]", client.Queue.Queue[client.Queue.CurrentIndex].AudioTrack.Info.Title, duration),
			Description: fmt.Sprintf("requested by %s", client.Queue.Queue[client.Queue.CurrentIndex].RequesterName),
			Color:       color,
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

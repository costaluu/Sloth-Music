package main

import (
	"fmt"
	"log"
	"reflect"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
	"github.com/lukasl-dev/waterlink/v2"
)

func (client *Client) Ready(session *discordgo.Session, event *discordgo.Ready) {
	client.SessionID = event.SessionID
	var err error

	client.LavalinkClient, err = waterlink.NewClient(fmt.Sprintf("http://%s", client.BotConfig.LavalinkHost), client.credentials())

	if err != nil {
		log.Fatalln("Failed to create waterlink client: ", err)
	}

	opts := waterlink.ConnectionOptions{
		EventHandler: waterlink.EventHandlerFunc(func(evt interface{}) {
			if reflect.TypeOf(evt).String() == "event.TrackEnd" {
				if client.PlayingMessageID != "" && client.AnchorTextChannel != "" {
					err := client.Session.ChannelMessageDelete(client.AnchorTextChannel, client.PlayingMessageID)

					if err != nil {
						fmt.Println("Failed to delete message: ", err.Error())
					}
				}

				client.PlayTrack()
			} else if reflect.TypeOf(evt).String() == "event.TrackStuck" {
				guild := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID))

				guild.SetPaused(false)
			} else if reflect.TypeOf(evt).String() == "event.TrackStart" {

				var icon string
				var color int

				if client.Queue.Queue[client.Queue.GetNextIndex()].Source == SpotifySource {
					icon = spotifyLogoURL
					color = COLOR_SPOTIFY
				} else {
					icon = youtubeLogoURL
					color = COLOR_YOUTUBE
				}

				var duration string

				if client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Stream == true {
					duration = "🔴 Live"
				} else {
					duration = client.Queue.GetDurationString(client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Length, false)
				}

				response := discordgo.MessageEmbed{
					Type: discordgo.EmbedTypeRich,
					Author: &discordgo.MessageEmbedAuthor{
						Name:    "Now playing 🔊",
						IconURL: icon,
					},
					URL:         client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.URI,
					Title:       fmt.Sprintf("%s - [%s]", client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Title, duration),
					Description: fmt.Sprintf("requested by %s", client.Queue.Queue[client.Queue.GetNextIndex()].RequesterName),
					Color:       color,
				}

				msg, err := client.Session.ChannelMessageSendEmbed(client.AnchorTextChannel, &response)

				if err != nil {
					log.Println("Failed to send message!")
				} else {
					client.PlayingMessageID = msg.ID
				}

			} else if reflect.TypeOf(evt).String() == "event.TrackException" {
				/* Skip */

				client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Title = "Track Exception: " + client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Title

				client.EventMessage(CustomError("Something went wrong, skipping..."), COLOR_ERROR)

				client.IsPlaying = false

				client.PlayTrack()
			} else if reflect.TypeOf(evt).String() == "event.WebSocketClosed" {
				/* Kill the bot */

				client.EventMessage(CustomError("Connection lost, leaving..."), COLOR_ERROR)

				client.BotClearState(true)
			}
		}),
	}

	client.LavalinkConnection, err = waterlink.Open(fmt.Sprintf("ws://%s", client.BotConfig.LavalinkHost), client.credentials(), opts)

	if err != nil {
		log.Fatalln("Failed to create waterlink connection: ", err)
	}

	setupCommands(&Bot)

	Bot.AnchorTextChannel = ""
	Bot.KeepAlive = false
	Bot.IsPlaying = false

	log.Printf("Bot %s#%s is online!\n", event.User.Username, event.User.Discriminator)

	client.Session.UpdateListeningStatus(fmt.Sprintf("s%shelp.", client.BotConfig.BotIdentificator))
}

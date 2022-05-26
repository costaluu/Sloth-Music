package main

import (
	"fmt"
	"strings"

	"github.com/bwmarrin/discordgo"
)

var PlayCommand Command = Command{
	Name:        "play",
	Description: "test help",
	Aliases:     []string{"p"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		userPermission, userVoiceState, botVoiceState := client.CheckPermissionsForUser(message)

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

		if len(client.Queue.Queue) == MaxPages*MaxSongsPerPage {
			client.MessageInteraction(message, CustomWarning("I've reached my limit of songs in the queue."), COLOR_INFO)

			return
		}

		if botVoiceState == nil {

			// bot setup

			voiceChannel, err := client.Session.Channel(userVoiceState.ChannelID)

			if err != nil {
				client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

				return
			}

			err = client.Session.ChannelVoiceJoinManual(message.GuildID, userVoiceState.ChannelID, false, true)

			if err != nil {
				client.MessageInteraction(message, CustomWarning("Failed to join the voice channel, i need the permission to `speak` and `join` in this voice channel, please try again!"), COLOR_WARNING)

				return
			}

			client.AnchorTextChannel = message.ChannelID
			client.AnchorVoiceChannel = voiceChannel.ID
			client.Queue = Queue{
				CurrentIndex:  -1,
				Queue:         make([]Track, 0),
				RepeatingMode: RepeatingModeOff,
			}
		}

		var songs []string = strings.Split(arg, ";")

		for _, userQuery := range songs {
			tracks, result, playlistName, tracksToPush := client.SearchEngine(userQuery, message.Author.String())

			if result == SEARCH_ENGINE_NOT_FOUND {
				client.MessageInteraction(message, CustomInfo(fmt.Sprintf("No results found for %s", userQuery)), COLOR_INFO)

				continue
			} else if result == SEARCH_ENGINE_ERROR {
				client.MessageInteraction(message, CustomError(fmt.Sprintf("Failed to enqueue %s", userQuery)), COLOR_ERROR)

				continue
			} else {
				client.Queue.Push(tracks...)

				if len(tracks) > 1 {
					go client.LazyLoading()

					client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("%s Enqueued %s with %v songs.", EMOJI_PLAYLIST, playlistName, tracksToPush)), COLOR_SUCCESS)
				} else {
					client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("%s Enqueued %s at position %v.", EMOJI_SONG, tracks[0].AudioTrack.Info.Title, len(client.Queue.Queue))), COLOR_SUCCESS)
				}
			}
		}

		if len(client.Queue.Queue) == MaxPages*MaxSongsPerPage {
			client.MessageInteraction(message, CustomWarning("I've reached my limit of songs in the queue."), COLOR_WARNING)
		}

		if client.IsPlaying == false && len(client.Queue.Queue) > 0 {
			client.PlayTrack()
		}
	},
}

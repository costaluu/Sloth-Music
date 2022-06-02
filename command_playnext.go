package main

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/bwmarrin/discordgo"
)

var PlayNextCommand Command = Command{
	Name:        "playnext",
	Description: "Enqueue a song in the next position, it can be a song in queue or a [title/link].\ns[index]playnext [position in queue/link/title/song]",
	Aliases:     []string{"pln", "setnext"},
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

		var InQueuePattern = regexp.MustCompile(`^[\d]+`)
		InQueue := InQueuePattern.MatchString(arg)
		var conv int

		if InQueue {
			var err error
			conv, err = strconv.Atoi(arg)
			if err != nil {
				client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

				return
			}
			if conv-1 < 0 || int(conv)-1 >= len(client.Queue.Queue) {
				client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

				return
			}
			if (conv - 1) == client.Queue.GetNextIndex() {
				client.MessageInteraction(message, CustomWarning("You can't delete the current song!"), COLOR_WARNING)

				return
			}
			client.Queue.Move(conv-1, int(client.Queue.GetNextIndex()+1))
			client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)

			return
		} else if arg != "" {
			if len(client.Queue.Queue) == MaxPages*MaxSongsPerPage {
				client.MessageInteraction(message, CustomWarning("I've reached my limit of songs in the queue."), COLOR_INFO)

				return
			}

			tracks, result, _, _ := client.SearchEngine(arg, message.Author.String())

			if result == SEARCH_ENGINE_NOT_FOUND {
				client.MessageInteraction(message, CustomInfo(fmt.Sprintf("No results found for %s.", arg)), COLOR_INFO)

				return
			} else if result == SEARCH_ENGINE_ERROR {
				client.MessageInteraction(message, CustomError(fmt.Sprintf("Failed to enqueue %s.", arg)), COLOR_ERROR)

				return
			} else {
				if len(tracks) > 1 {
					client.MessageInteraction(message, CustomError(fmt.Sprintf("You can't playnext a playlist.")), COLOR_ERROR)

					return
				} else {
					client.Queue.Push(tracks...)

					client.Queue.Move(len(client.Queue.Queue)-1, int(client.Queue.GetNextIndex()+1))

					client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("%s Enqueued %s at position %v.", EMOJI_SONG, tracks[0].AudioTrack.Info.Title, client.Queue.GetNextIndex()+2)), COLOR_SUCCESS)
				}
			}
		} else {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		if len(client.Queue.Queue) == MaxPages*MaxSongsPerPage {
			client.MessageInteraction(message, CustomWarning("I've reached my limit of songs in the queue."), COLOR_INFO)
		}
	},
}

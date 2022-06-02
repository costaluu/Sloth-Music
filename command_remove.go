package main

import (
	"strconv"
	"strings"

	"github.com/bwmarrin/discordgo"
)

var RemoveCommand Command = Command{
	Name:        "remove",
	Description: "Removes a song from the queue.\ns[index]remove [position]",
	Aliases:     []string{"rm", "delete"},
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

		var posToRemove []string = strings.Split(arg, " ")

		if len(posToRemove) == 1 {
			pos, err := strconv.Atoi(posToRemove[0])

			if err != nil {
				client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

				return
			}

			if pos-1 < 0 || int(pos)-1 >= len(client.Queue.Queue) {
				client.MessageInteraction(message, "Please inform a valid input!", COLOR_ERROR)

				return
			}

			if (pos - 1) == client.Queue.GetNextIndex() {
				client.MessageInteraction(message, "You can't delete the current song!", COLOR_ERROR)

				return
			}

			client.Queue.Remove(pos - 1)

			client.MessageInteraction(message, "Song removed!", COLOR_SUCCESS)
		} else {
			var positions []int = []int{}

			for _, istr := range posToRemove {
				conv, err := strconv.Atoi(istr)

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

				positions = append(positions, conv-1)
			}

			var newQueue []Track = []Track{}
			var lowerBound int = 0

			for i := 0; i < len(positions); i++ {
				newQueue = append(newQueue, client.Queue.Queue[lowerBound:positions[i]]...)
				lowerBound = positions[i] + 1
			}

			client.Queue.Queue = newQueue
			client.Queue.CurrentIndex -= int16(len(posToRemove))

			client.MessageInteraction(message, CustomSuccess("Song(s) removed."), COLOR_SUCCESS)
		}
	},
}

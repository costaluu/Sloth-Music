package main

import (
	"math/rand"
	"time"

	"github.com/bwmarrin/discordgo"
)

var ShuffleCommand Command = Command{
	Name:        "shuffle",
	Description: "Shuffles the next songs from the queue.",
	Aliases:     []string{"shfl", "rand"},
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

		if len(client.Queue.Queue) < 2 && int(client.Queue.GetNextIndex()+1) < len(client.Queue.Queue) {
			client.MessageInteraction(message, CustomError("You can't do that!"), COLOR_ERROR)

			return
		}

		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(client.Queue.Queue[client.Queue.GetNextIndex()+1:]), func(i, j int) {
			client.Queue.Queue[int(client.Queue.GetNextIndex()+1)+i], client.Queue.Queue[int(client.Queue.GetNextIndex()+1)+j] = client.Queue.Queue[int(client.Queue.GetNextIndex()+1)+j], client.Queue.Queue[int(client.Queue.GetNextIndex()+1)+i]
		})

		client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)
	},
}

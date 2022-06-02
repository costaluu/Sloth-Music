package main

import (
	"github.com/bwmarrin/discordgo"
)

var ReverseCommand Command = Command{
	Name:        "reverse",
	Description: "Reverses the next songs in queue.",
	Aliases:     []string{"rr"},
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

		// algorithm to reverse

		var i int = int(client.Queue.GetNextIndex() + 1)
		var j int = len(client.Queue.Queue) - 1

		for ; i < j; i, j = i+1, j-1 {
			client.Queue.Queue[i], client.Queue.Queue[j] = client.Queue.Queue[j], client.Queue.Queue[i]
		}

		client.MessageInteraction(message, CustomSuccess("Queue reversed!"), COLOR_SUCCESS)
	},
}

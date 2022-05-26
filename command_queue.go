package main

import (
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"
)

var QueueCommand Command = Command{
	Name:        "queue",
	Description: "test help",
	Aliases:     []string{"q", "list"},
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

		page, err := strconv.Atoi(arg)

		if err != nil || page < 1 || page > client.Queue.PagesCount() {
			if client.Queue.CurrentIndex+1 < MaxSongsPerPage {
				page = 1
			} else if (client.Queue.CurrentIndex+1)%MaxSongsPerPage == 0 {
				page = int((client.Queue.CurrentIndex + 1) / MaxSongsPerPage)
			} else {
				page = int((client.Queue.CurrentIndex+1)/MaxSongsPerPage) + 1
			}
		}

		msg, err := client.Session.ChannelMessageSend(message.ChannelID, client.PageTextGenerator(int(page)))

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

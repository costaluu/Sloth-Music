package main

import (
	"fmt"
	"sort"

	"github.com/bwmarrin/discordgo"
)

type ByTitle []Track

func (a ByTitle) Len() int           { return len(a) }
func (a ByTitle) Less(i, j int) bool { return a[i].AudioTrack.Info.Title < a[j].AudioTrack.Info.Title }
func (a ByTitle) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

type ByRequester []Track

func (a ByRequester) Len() int           { return len(a) }
func (a ByRequester) Less(i, j int) bool { return a[i].RequesterName < a[j].RequesterName }
func (a ByRequester) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

var SortCommand Command = Command{
	Name:        "sort",
	Description: "Sort the next songs in queue.\ns[index]sort [title/requester]",
	Aliases:     []string{},
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

		if len(client.Queue.Queue) < 2 && int(client.Queue.CurrentIndex+1) < len(client.Queue.Queue) {
			client.MessageInteraction(message, CustomError("You can't do that!"), COLOR_ERROR)

			return
		}

		if arg == "title" {
			sort.Sort(ByTitle(client.Queue.Queue[client.Queue.CurrentIndex+1:]))
		} else if arg == "requester" {
			sort.Sort(ByRequester(client.Queue.Queue[client.Queue.CurrentIndex+1:]))
		} else {
			client.MessageInteraction(message, CustomWarning("Invalid input, try: `title` or `requester`."), COLOR_WARNING)

			return
		}

		client.MessageInteraction(message, CustomSuccess(fmt.Sprintf("Queue sorted by %s", arg)), COLOR_SUCCESS)
	},
}

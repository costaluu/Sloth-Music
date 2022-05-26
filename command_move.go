package main

import (
	"strconv"
	"strings"

	"github.com/bwmarrin/discordgo"
)

var MoveCommand Command = Command{
	Name:        "move",
	Description: "test help",
	Aliases:     []string{"mv"},
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

		var args []string = strings.Split(arg, " ")

		if len(args) != 2 {
			client.MessageInteraction(message, CustomTip("Please inform a valid input! Ex: s[index]move `from` `to`"), COLOR_INFO)

			return
		}

		from, err := strconv.Atoi(args[0])

		if err != nil || from < 1 || from > len(client.Queue.Queue) {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		to, err := strconv.Atoi(args[1])

		if err != nil || to < 1 || to > len(client.Queue.Queue) {
			client.MessageInteraction(message, WARN_INVALID_INPUT, COLOR_WARNING)

			return
		}

		client.Queue.Move(from, to)

		client.MessageInteraction(message, SUCCESS_MSG, COLOR_SUCCESS)
	},
}

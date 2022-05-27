package main

import (
	"fmt"
	"regexp"

	"github.com/bwmarrin/discordgo"
)

func (client *Client) MessageCreate(session *discordgo.Session, message *discordgo.MessageCreate) {

	if message.Author.Bot == true || message.GuildID == "" {
		return
	}

	for _, mentions := range message.Mentions {
		if mentions.ID == client.BotConfig.BotID {
			client.Session.ChannelMessageSend(message.ChannelID, fmt.Sprintf("Hello! you can use `s%shelp` to see my comands.", client.BotConfig.BotIdentificator))

			return
		}
	}

	regex := regexp.MustCompile(`^s([0-9])([^\s]+)\s*(.*)`)

	processedContent := regex.FindStringSubmatch(message.Content)

	if len(processedContent) == 0 {
		return
	}

	var botID string = processedContent[1]
	var command string = processedContent[2]
	var arg string = processedContent[3]

	if botID != client.BotConfig.BotIdentificator {
		return
	}

	if cmd, ok := client.Commands[command]; ok {
		cmd.Instance(client, message, arg)

		client.DeleteAfterEphemeralTime(message)
	} else {
		client.MessageInteraction(message, "Command not found", COLOR_ERROR)
	}
}

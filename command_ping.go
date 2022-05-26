package main

import (
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"
)

var PingCommand Command = Command{
	Name:        "ping",
	Description: "Shows information about the bot connection.",
	Aliases:     []string{"png"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		startTime := time.Now()

		msg, err := client.Session.ChannelMessageSend(message.ChannelID, "Pinging...")

		if err != nil {
			fmt.Println("Error while sending msg")

			return
		}

		client.Session.ChannelMessageEdit(msg.ChannelID, msg.ID, fmt.Sprintf("**🏓 Pong! It took %v ms ⌛**", time.Now().Sub(startTime).Milliseconds()))

		go func() {
			time.Sleep(time.Duration(ephemeralTime) * time.Second)

			client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
		}()
	},
}

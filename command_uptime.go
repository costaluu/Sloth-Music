package main

import (
	"fmt"
	"time"

	"github.com/bwmarrin/discordgo"
)

var UptimeCommand Command = Command{
	Name:        "uptime",
	Description: "test help",
	Aliases:     []string{"upt"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		timeDiff := time.Now().Sub(client.StartTime)

		days := 0
		hours := int(timeDiff.Hours())

		if timeDiff > 24 {
			days = int(timeDiff.Hours()) / 24
			hours = int(timeDiff.Hours()) % 24
		}

		client.MessageInteraction(message, fmt.Sprintf("**I've been online for `%v` day(s), `%v` hour(s), `%v` minute(s) and `%v` seconds ⌛**", days, hours, timeDiff.Minutes(), timeDiff.Seconds()), COLOR_INFO)
	},
}

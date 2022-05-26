package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
)

var HelpCommand Command = Command{
	Name:        "help",
	Description: "test help",
	Aliases:     []string{"hlp"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		if len(arg) == 0 {
			fields := make([]*discordgo.MessageEmbedField, 0)

			fields = append(fields, &discordgo.MessageEmbedField{
				Name:   "Common commands",
				Value:  "`ping`, `help`, `about`, `uptime`",
				Inline: false,
			})

			fields = append(fields, &discordgo.MessageEmbedField{
				Name:   "Music commands",
				Value:  "`play`, `pause`, `resume`, `clear`, `search`, `queue`, `remove`, `seek`, `leave`, `skip`, `loop`, `jump`, `nowplaying`, `playnext`, `lyrics`, `shuffle`, `fairshuffle`, `thread`",
				Inline: false,
			})

			fields = append(fields, &discordgo.MessageEmbedField{
				Name:   "Filter commands",
				Value:  "`bassboost`",
				Inline: false,
			})

			response := discordgo.MessageEmbed{
				Type:        discordgo.EmbedTypeRich,
				Title:       "Commands for Sloth Music Bot",
				Description: "```ini\nYou can use " + fmt.Sprintf("s%shelp", os.Getenv("BOT_ID")) + " [command] to get more info about a specific command.\n\nTemplate: s[index][command/alias] [arg]\n\nObs: [index/command/alias] means that you should use the command without [].\n```",
				Fields:      fields,
				Timestamp:   CurrentTimestamp(),
				Footer:      client.DefautlFooter(message),
				Color:       COLOR_INFO,
			}

			msg, err := client.Session.ChannelMessageSendEmbed(message.ChannelID, &response)

			if err != nil {
				fmt.Println(err.Error())
				log.Println("Failed to send message!")

				return
			}

			go func() {
				time.Sleep(time.Duration(ephemeralTime) * time.Second)

				client.Session.ChannelMessageDelete(message.ChannelID, message.ID)
				client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
			}()
		} else {
			if command, ok := client.Commands[arg]; ok {
				AliasesString := ""

				for _, al := range command.Aliases {
					AliasesString += fmt.Sprintf("`%s`, ", al)
				}

				AliasesString = AliasesString[:len(AliasesString)-2]

				client.CommandEmbedAnswer(message, fmt.Sprintf("%s command", command.Name), fmt.Sprintf("```ini\n"+"[Aliases]: %s\n\n[Description]: %s", AliasesString, command.Description)+"\n```", COLOR_INFO)
			} else {
				client.MessageInteraction(message, "Command not found", COLOR_ERROR)
			}
		}
	},
}

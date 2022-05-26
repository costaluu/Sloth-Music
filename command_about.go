package main

import (
	"fmt"
	"os"
	"time"

	"github.com/bwmarrin/discordgo"
)

var AboutCommand Command = Command{
	Name:        "about",
	Description: "test help",
	Aliases:     []string{"abt"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		fields := make([]*discordgo.MessageEmbedField, 0)

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Youtube Support",
			Value:  "Videos: ✅ | Playlists: ✅ | Lives: ✅",
			Inline: true,
		})

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Spotify Support",
			Value:  "Songs ⚠️ | Playlists: ⚠️ | Albums: ⚠️",
			Inline: false,
		})

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Contribute",
			Value:  "You can access [github](https://github.com/costaluu/Sloth-Music) for more information.",
			Inline: false,
		})

		guild, err := client.Session.Guild(message.GuildID)

		if err != nil {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		response := discordgo.MessageEmbed{
			Type:        discordgo.EmbedTypeRich,
			Title:       "Commands for Sloth Music Bot",
			Description: "```ini\n" + "The Sloth Music Bot is a dedicated music bot for The Language Sloth server made with Java and GOLANG. This bot is and maintained by Costa'.\n\nFeel free to report any bug 🐛 or problem in the suggestions channel. You can use the help command " + fmt.Sprintf("s%shelp", os.Getenv("BOT_IDENTIFICATOR")) + " to see all the avaliable commands.\n\nObs: Spotify does not allow songs to be played directly, in practice the equivalent song is found on youtube." + "\n```",
			Fields:      fields,
			Timestamp:   CurrentTimestamp(),
			Footer: &discordgo.MessageEmbedFooter{
				Text:    "Made with ❤️ with GO.",
				IconURL: guild.IconURL(),
			},
			Color: COLOR_INFO,
		}

		msg, err := client.Session.ChannelMessageSendEmbed(message.ChannelID, &response)

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

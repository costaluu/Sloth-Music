package main

import (
	"fmt"
	"log"
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
			Name:   "Soundcloud Support",
			Value:  "Songs: ✅ | Playlists: ✅ | Albums: ✅",
			Inline: false,
		})

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Spotify Support",
			Value:  "Songs ⚠️ | Playlists: ⚠️ | Albums: ⚠️",
			Inline: false,
		})

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Vimeo Support",
			Value:  "Songs ✅ | Playlists: ✅",
			Inline: false,
		})

		fields = append(fields, &discordgo.MessageEmbedField{
			Name:   "Contribute",
			Value:  "You can access [github](https://github.com/costaluu/Sloth-Music) for more information.",
			Inline: false,
		})

		response := discordgo.MessageEmbed{
			Type:        discordgo.EmbedTypeRich,
			Title:       "Commands for Sloth Music Bot",
			Description: "```ini\n" + "The Sloth Music Bot is a dedicated music bot for The Language Sloth server made with Java, Javascript and Typescript and maintained by costa.\n\nFeel free to report any bug🐛 or problem in the suggestion channel. You can use the help command" + fmt.Sprintf("s%shelp", os.Getenv("BOT_ID")) + " to see all the avaliable commands.\n\nObs: Spotify does not allow songs to be played directly, in practice the equivalent song is found on youtube." + "\n```",
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
			client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
		}()
	},
}

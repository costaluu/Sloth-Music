package main

import (
	"github.com/bwmarrin/discordgo"
)

var LyricsCommand Command = Command{
	Name:        "lyrics",
	Description: "Search for lyrics for a specific artist-song.\ns[index]lyrics [artist] [song]",
	Aliases:     []string{"ly"},
	Instance: func(client *Client, message *discordgo.MessageCreate, arg string) {
		client.MessageInteraction(message, "⚠️ | Command in maintenance.", COLOR_WARNING)

		return

		/* userPermission, _, _ := client.CheckPermissionsForUser(message)

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

		if client.IsPlaying == false {
			client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

			return
		}

		var args []string = strings.Split(arg, ",")

		if len(args) != 2 {
			client.MessageInteraction(message, CustomTip("Please inform a valid input. Ex: s[index]lyrics `artist`,`song`"), COLOR_INFO)

			return
		}

		lyric, err := client.LyricsClient.Search(args[0], args[1])

		if err != nil {
			client.MessageInteraction(message, CustomInfo(fmt.Sprintf("Lyrics for %s-%s were not found.", args[0], args[1])), COLOR_INFO)

			return
		}

		var lines []string = strings.Split(lyric, "\n")

		var chunks [][]string = make([][]string, 0)

		var count int = 0
		var chunkPOS = 0

		for _, line := range lines {
			if count == 40 {
				chunks = append(chunks, make([]string, 0))
				chunkPOS += 1
			}

			chunks[chunkPOS] = append(chunks[chunkPOS], line)
			count += 1
		}

		var msgs []*discordgo.Message

		for i, chunk := range chunks {
			var text string
			var embed discordgo.MessageEmbed

			for _, line := range chunk {
				text += line
				text += "\n"
			}

			if i == 0 {
				embed = discordgo.MessageEmbed{
					Type:        discordgo.EmbedTypeRich,
					Title:       fmt.Sprintf("Lyrics for %s-%s", args[0], args[1]),
					Description: text,
					Color:       COLOR_INFO,
				}
			} else {
				embed = discordgo.MessageEmbed{
					Type:        discordgo.EmbedTypeRich,
					Title:       "Continuation of lyrics",
					Description: text,
					Color:       COLOR_INFO,
				}
			}

			msg, err := client.Session.ChannelMessageSendEmbed(client.AnchorTextChannel, &embed)

			if err != nil {
				client.MessageInteraction(message, ERROR_MSG, COLOR_ERROR)

				return
			}

			msgs = append(msgs, msg)
		}

		go func() {
			time.Sleep(time.Duration(ephemeralTime) * time.Second)

			for _, msg := range msgs {
				client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
			}
		}() */
	},
}

package main

import (
	"fmt"
	"log"
	"regexp"
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"
)

const (
	EMOJI_SUCESS   = "✅"
	EMOJI_ERROR    = "❌"
	EMOJI_PLAYLIST = "💽"
	EMOJI_SONG     = "🎵"
)

const (
	spotifyLogoURL = "https://www.freepnglogos.com/uploads/spotify-logo-png/spotify-icon-marilyn-scott-0.png"
	youtubeLogoURL = "https://logodownload.org/wp-content/uploads/2014/10/youtube-logo-5-2-1536x1073.png"
)

const (
	COLOR_ERROR   int = 16538725
	COLOR_WARNING     = 16700208
	COLOR_INFO        = 4565746
	COLOR_SUCCESS     = 2547329
	COLOR_SPOTIFY     = 1947988
	COLOR_YOUTUBE     = 16711680
)

const (
	ERROR_MSG          string = "❌ | Something went wrong, try again."
	WARN_INVALID_INPUT        = "⚠️ | Please check your input."
	WARN_NO_PERMISSION        = "⚠️ | You don't have permission."
	SUCCESS_MSG               = "✅ | Command performed."
)

func CustomTip(content string) string {
	return fmt.Sprintf("🔎 TIP | %s", content)
}

func CustomSuccess(content string) string {
	return fmt.Sprintf("✅ | %s", content)
}

func CustomWarning(content string) string {
	return fmt.Sprintf("✅ | %s", content)
}

func CustomInfo(content string) string {
	return fmt.Sprintf("ℹ️ | %s", content)
}

func CustomError(content string) string {
	return fmt.Sprintf("❌ | %s", content)
}

const ephemeralTime uint8 = 20

func (client *Client) CommandEmbedAnswer(message *discordgo.MessageCreate, title string, description string, color int) {
	response := discordgo.MessageEmbed{
		Type:        discordgo.EmbedTypeRich,
		Title:       title,
		Description: description,
		Color:       color,
	}

	msg, err := client.Session.ChannelMessageSendEmbed(message.ChannelID, &response)

	if err != nil {
		log.Println("Failed to send message!")
	}

	go func() {
		time.Sleep(time.Duration(ephemeralTime) * time.Second)

		client.Session.ChannelMessageDelete(message.ChannelID, message.ID)
		client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
	}()
}

func (client *Client) MessageInteraction(message *discordgo.MessageCreate, title string, color int) {
	response := discordgo.MessageEmbed{
		Type:  discordgo.EmbedTypeRich,
		Title: title,
		Color: color,
	}

	msg, err := client.Session.ChannelMessageSendEmbed(message.ChannelID, &response)

	if err != nil {
		log.Println("Failed to send message!")
	}

	go func() {
		time.Sleep(time.Duration(ephemeralTime) * time.Second)

		client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
		client.Session.ChannelMessageDelete(message.ChannelID, message.ID)
	}()
}

func (client *Client) EventMessage(title string, color int) {
	response := discordgo.MessageEmbed{
		Type:  discordgo.EmbedTypeRich,
		Title: title,
		Color: color,
	}

	msg, err := client.Session.ChannelMessageSendEmbed(client.AnchorTextChannel, &response)

	if err != nil {
		log.Println("Failed to send message!")
	}

	go func() {
		time.Sleep(time.Duration(ephemeralTime) * time.Second)

		client.Session.ChannelMessageDelete(msg.ChannelID, msg.ID)
	}()
}

func (client *Client) DefautlFooter(message *discordgo.MessageCreate) *discordgo.MessageEmbedFooter {

	guild, _ := client.Session.Guild(message.GuildID)

	return &discordgo.MessageEmbedFooter{
		Text:    guild.Name,
		IconURL: guild.IconURL(),
	}
}

func (client *Client) DeleteAfterEphemeralTime(message *discordgo.MessageCreate) {
	go func() {
		time.Sleep(time.Duration(ephemeralTime) * time.Second)

		client.Session.ChannelMessageDelete(message.ChannelID, message.ID)
	}()
}

func CurrentTimestamp() string {
	return time.Now().Format(time.RFC3339)
}

func min(a, b int) int {
	if a > b {
		return b
	} else {
		return a
	}
}

func max(a, b int) int {
	if a > b {
		return a
	} else {
		return b
	}
}

func ceil(a, b int) int {
	if a%b == 0 {
		return a / b
	} else {
		return (a / b) + 1
	}
}

func (client *Client) CheckPermissionsForUser(message *discordgo.MessageCreate) (PermissionType, *discordgo.VoiceState, *discordgo.VoiceState) {
	guild, err := client.Session.Guild(message.GuildID)

	if err != nil {
		return PERM_ERROR, nil, nil
	}

	err = client.Session.State.GuildAdd(guild)

	if err != nil {
		return PERM_ERROR, nil, nil
	}

	var liveGuild *discordgo.Guild

	for _, g := range client.Session.State.Guilds {
		if g.ID == guild.ID {
			liveGuild = g

			break
		}
	}

	var userVoiceState *discordgo.VoiceState = nil
	var botVoiceState *discordgo.VoiceState = nil

	for _, v := range liveGuild.VoiceStates {
		if v.UserID == message.Author.ID {
			userVoiceState = v
		} else if v.UserID == client.BotConfig.BotID {
			botVoiceState = v
		}
	}

	if userVoiceState == nil {
		return PERM_NOT_IN_VC, nil, nil
	}

	if botVoiceState != nil && botVoiceState.ChannelID != userVoiceState.ChannelID {
		return PERM_WRONG_VC, nil, nil
	}

	return PERM_IN_VC, userVoiceState, botVoiceState
}

func ProgressBar(current, total uint) string {
	var progress uint = (current * 100) / total

	var i uint
	var bar string = ""
	emptyProgress := total - progress

	for i = 0; i < progress; i++ {
		bar = bar + "▬"
	}

	bar = bar + "🔵"

	for i = 0; i < emptyProgress; i++ {
		bar = bar + "▬"
	}

	return bar
}

func DurationToMS(durationStr string) (int, error) {
	daysPattern := regexp.MustCompile("^([0-9]+):(\\d?\\d):(\\d?\\d):(\\d?\\d)$")
	hoursPattern := regexp.MustCompile("^(\\d?\\d):(\\d?\\d):(\\d?\\d)$")
	minutesPattern := regexp.MustCompile("^(\\d?\\d):(\\d?\\d)$")
	secondsPattern := regexp.MustCompile("^(\\d?\\d)$")

	regexDays := daysPattern.FindStringSubmatch(durationStr)
	regexHours := hoursPattern.FindStringSubmatch(durationStr)
	regexMinutes := minutesPattern.FindStringSubmatch(durationStr)
	regexSeconds := secondsPattern.FindStringSubmatch(durationStr)

	if len(regexDays) > 0 {
		days, err := strconv.Atoi(regexDays[1])

		if err != nil {
			return 0, err
		}

		hours, err := strconv.Atoi(regexDays[2])

		if err != nil {
			return 0, err
		}

		minutes, err := strconv.Atoi(regexDays[3])

		if err != nil {
			return 0, err
		}

		seconds, err := strconv.Atoi(regexDays[4])

		if err != nil {
			return 0, err
		}

		return ((days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000)), nil
	} else if len(regexHours) > 0 {
		hours, err := strconv.Atoi(regexDays[1])

		if err != nil {
			return 0, err
		}

		minutes, err := strconv.Atoi(regexDays[2])

		if err != nil {
			return 0, err
		}

		seconds, err := strconv.Atoi(regexDays[3])

		if err != nil {
			return 0, err
		}

		return ((hours * 3600000) + (minutes * 60000) + (seconds * 1000)), nil
	} else if len(regexMinutes) > 0 {
		minutes, err := strconv.Atoi(regexDays[1])

		if err != nil {
			return 0, err
		}

		seconds, err := strconv.Atoi(regexDays[2])

		if err != nil {
			return 0, err
		}

		return ((minutes * 60000) + (seconds * 1000)), nil
	} else if len(regexSeconds) > 0 {
		seconds, err := strconv.Atoi(regexDays[1])

		if err != nil {
			return 0, err
		}

		return (seconds * 1000), nil
	} else {
		return -1, nil
	}
}

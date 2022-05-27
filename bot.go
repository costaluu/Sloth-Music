package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	spotifyauth "github.com/zmb3/spotify/v2/auth"

	"github.com/bwmarrin/discordgo"
	"github.com/gompus/snowflake"
	"github.com/joho/godotenv"

	"github.com/lukasl-dev/waterlink/v2"
	lyrics "github.com/rhnvrm/lyric-api-go"
	"github.com/zmb3/spotify/v2"
	"golang.org/x/oauth2/clientcredentials"
)

var Bot Client

var BotCommands []Command = []Command{
	HelpCommand,
	AboutCommand,
	PingCommand,
	UptimeCommand,
	PlayCommand,
	QueueCommand,
	SkipCommand,
	PauseCommand,
	ResumeCommand,
	LeaveCommand,
	ClearCommand,
	JumpCommand,
	RepeatCommand,
	ReverseCommand,
	SortCommand,
	VolumeCommand,
	ShuffleCommand,
	NowPlayingCommand,
	RemoveCommand,
	UpCommingCommand,
	PlayNextCommand,
	MoveCommand,
	KeepAliveCommand,
	LyricsCommand,
}

func main() {
	err := godotenv.Load()
	Bot.StartTime = time.Now()

	Bot.SpotifyContext = context.Background()
	config := &clientcredentials.Config{
		ClientID:     os.Getenv("SPOTIFY_ID"),
		ClientSecret: os.Getenv("SPOTIFY_SECRET"),
		TokenURL:     spotifyauth.TokenURL,
	}

	Bot.SpotifyToken, err = config.Token(Bot.SpotifyContext)

	if err != nil {
		log.Fatalf("Couldn't get spotify token: %v", err)
	}

	Bot.SpotifyHTTPClient = spotifyauth.New().Client(Bot.SpotifyContext, Bot.SpotifyToken)
	Bot.SpotifyClient = spotify.New(Bot.SpotifyHTTPClient)

	Bot.LyricsClient = lyrics.New()

	Bot.BotConfig = Config{
		Token:            os.Getenv("TOKEN"),
		LavalinkHost:     os.Getenv("LAVALINK_HOST"),
		LavalinkPass:     os.Getenv("LAVALINK_PASS"),
		BotIdentificator: os.Getenv("BOT_IDENTIFICATOR"),
		BotID:            os.Getenv("BOT_ID"),
		GuildID:          os.Getenv("GUILD_ID"),
		ControlRole:      os.Getenv("CONTROL_ROLE_ID"),
		IdleTime:         60,
	}

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	Bot.Session, Bot.Error_session = discordgo.New("Bot " + os.Getenv("TOKEN"))

	if Bot.Error_session != nil {
		log.Fatalln("error creating Discord session, ", err)
		return
	}

	Bot.Session.StateEnabled = true
	Bot.Session.State.TrackVoice = true
	Bot.Session.State.TrackChannels = true
	Bot.Session.AddHandler(Bot.Ready)
	Bot.Session.AddHandler(Bot.MessageCreate)
	Bot.Session.AddHandler(Bot.VoiceUpdate)
	Bot.Session.AddHandler(Bot.VoiceStateUpdate)

	Bot.Session.Identify.Intents = discordgo.IntentsAll

	err = Bot.Session.Open()

	if err != nil {
		log.Fatalln("error opening connection,", err)
	}
	defer Bot.Session.Close()

	sc := make(chan os.Signal, 1)
	signal.Notify(sc, syscall.SIGINT, syscall.SIGTERM, os.Interrupt, os.Kill)
	<-sc
}

func setupCommands(client *Client) {
	client.Commands = make(map[string]Command)

	for i := 0; i < len(BotCommands); i += 1 {
		client.Commands[BotCommands[i].Name] = BotCommands[i]

		for j := 0; j < len(BotCommands[i].Aliases); j += 1 {
			client.Commands[BotCommands[i].Aliases[j]] = BotCommands[i]
		}
	}
}

func (client *Client) credentials() waterlink.Credentials {
	return waterlink.Credentials{
		Authorization: client.BotConfig.LavalinkPass,
		UserID:        snowflake.MustParse(client.Session.State.User.ID),
	}
}

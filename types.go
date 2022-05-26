package main

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/lukasl-dev/waterlink/v2"
	"github.com/lukasl-dev/waterlink/v2/track"
	"github.com/zmb3/spotify/v2"
	"golang.org/x/oauth2"
)

const (
	MaxSongsPerPage = 16
	MaxPages        = 16
)

const RFC3339Milli = "2006-01-02T15:04:05.000Z07:00"

type Command struct {
	Name        string
	Description string
	Aliases     []string
	Instance    func(client *Client, message *discordgo.MessageCreate, arg string)
}

type Config struct {
	Token            string
	LavalinkHost     string
	LavalinkPass     string
	BotIdentificator string
	GuildID          string
	BotID            string
	ControlRole      string
	IdleTime         uint
}

type Client struct {
	StartTime          time.Time
	Session            *discordgo.Session
	BotConfig          Config
	SessionID          string
	Error_session      error
	LavalinkClient     *waterlink.Client
	LavalinkConnection *waterlink.Connection
	Commands           map[string]Command
	Queue              Queue
	AnchorTextChannel  string
	AnchorVoiceChannel string
	KeepAlive          bool
	IsPlaying          bool
	PlayingMessageID   string
	SpotifyHTTPClient  *http.Client
	SpotifyClient      *spotify.Client
	SpotifyToken       *oauth2.Token
	SpotifyContext     context.Context
}

type PlayNextResult uint8

const (
	PLAY_NEXT_QUEUE_ENDED = iota
	PLAY_NEXT_TRACK_ERROR
	PLAY_NEXT_SUCCESS
)

type SearchEngineResult uint8

const (
	SEARCH_ENGINE_NOT_FOUND SearchEngineResult = iota
	SEARCH_ENGINE_ERROR
	SEARCH_ENGINE_SUCCESS
)

type PermissionType uint8

const (
	PERM_NOT_IN_VC PermissionType = iota
	PERM_WRONG_VC
	PERM_IN_VC
	PERM_ERROR
)

type SourceType uint8

const (
	YoutubeSource SourceType = iota
	SpotifySource
	NoneSource
)

type Track struct {
	AudioTrack            track.Track
	Source                SourceType
	RequesterName         string
	LazyLoaded            bool
	LazyLoadingSongTitle  string
	LazyLoadingSongArtist string
}

type Queue struct {
	CurrentIndex  int16
	Queue         []Track
	Mutex         sync.Mutex
	RepeatingMode RepeatingMode
}

type RepeatingMode int

const (
	RepeatingModeOff = iota
	RepeatingModeSong
	RepeatingModeQueue
)

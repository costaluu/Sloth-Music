package main

import (
	"fmt"
	"regexp"

	"github.com/lukasl-dev/waterlink/v2/track"
	"github.com/lukasl-dev/waterlink/v2/track/query"
	"github.com/zmb3/spotify/v2"
)

var youtubeUrlPattern = regexp.MustCompile("https:\\/\\/w?w?w?\\.?youtu\\.?be\\.?c?o?m?")
var spotifyUrlPattern = regexp.MustCompile(`https:\/\/open\.spotify\.com\/(\w+)\/(\w+)\?si=\w*`)

func (client *Client) SearchEngine(userQuery, author string) ([]Track, SearchEngineResult, string, int) {
	var queryResult *track.LoadResult
	var err error

	spotifyMatch := spotifyUrlPattern.FindStringSubmatch(userQuery)
	youtubeMatch := youtubeUrlPattern.MatchString(userQuery)

	if len(spotifyMatch) > 0 {
		if spotifyMatch[1] == "track" {
			spotifyTrack, err := Bot.SpotifyClient.GetTrack(Bot.SpotifyContext, spotify.ID(spotifyMatch[2]))

			if err != nil {
				return nil, SEARCH_ENGINE_ERROR, "", 0
			}

			queryResult, err = client.LavalinkClient.LoadTracks(query.YouTube(fmt.Sprintf("%s %s audio", spotifyTrack.Name, spotifyTrack.Artists[0].Name)))

			if err != nil {
				return nil, SEARCH_ENGINE_ERROR, "", 0
			}

			if len(queryResult.Tracks) == 0 {
				return nil, SEARCH_ENGINE_NOT_FOUND, "", 0
			}

			queryResult.Tracks[0].Info.Title = spotifyTrack.Name

			t := Track{
				AudioTrack:    queryResult.Tracks[0],
				Source:        SpotifySource,
				RequesterName: author,
				LazyLoaded:    true,
			}

			return []Track{t}, SEARCH_ENGINE_SUCCESS, "", 0
		} else if spotifyMatch[1] == "playlist" {
			spotifyPlaylist, err := Bot.SpotifyClient.GetPlaylist(Bot.SpotifyContext, spotify.ID(spotifyMatch[2]))

			if err != nil {
				return nil, SEARCH_ENGINE_ERROR, "", 0
			}

			var convertedSpotifyPlaylist []Track = make([]Track, 0)

			tracksToPush := ((MaxPages * MaxSongsPerPage) - len(client.Queue.Queue))

			if len(spotifyPlaylist.Tracks.Tracks) > tracksToPush {
				for _, spotifySong := range spotifyPlaylist.Tracks.Tracks[:tracksToPush] {
					t := Track{
						AudioTrack:            track.Track{},
						Source:                SpotifySource,
						RequesterName:         author,
						LazyLoaded:            false,
						LazyLoadingSongTitle:  spotifySong.Track.Name,
						LazyLoadingSongArtist: spotifySong.Track.Artists[0].Name,
					}

					convertedSpotifyPlaylist = append(convertedSpotifyPlaylist, t)
				}

				return convertedSpotifyPlaylist, SEARCH_ENGINE_SUCCESS, spotifyPlaylist.Name, tracksToPush
			} else {
				for _, spotifySong := range spotifyPlaylist.Tracks.Tracks {
					t := Track{
						AudioTrack:            track.Track{},
						Source:                SpotifySource,
						RequesterName:         author,
						LazyLoaded:            false,
						LazyLoadingSongTitle:  spotifySong.Track.Name,
						LazyLoadingSongArtist: spotifySong.Track.Artists[0].Name,
					}

					convertedSpotifyPlaylist = append(convertedSpotifyPlaylist, t)
				}

				return convertedSpotifyPlaylist, SEARCH_ENGINE_SUCCESS, spotifyPlaylist.Name, len(spotifyPlaylist.Tracks.Tracks)
			}
		} else if spotifyMatch[1] == "album" {
			spotifyAlbum, err := Bot.SpotifyClient.GetAlbum(Bot.SpotifyContext, spotify.ID(spotifyMatch[2]))

			if err != nil {
				return nil, SEARCH_ENGINE_ERROR, "", 0
			}

			var convertedSpotifyAlbum []Track = make([]Track, 0)

			tracksToPush := ((MaxPages * MaxSongsPerPage) - len(client.Queue.Queue))

			if len(spotifyAlbum.Tracks.Tracks) > tracksToPush {
				for _, spotifySong := range spotifyAlbum.Tracks.Tracks[:tracksToPush] {
					t := Track{
						AudioTrack:            track.Track{},
						Source:                SpotifySource,
						RequesterName:         author,
						LazyLoaded:            false,
						LazyLoadingSongTitle:  spotifySong.Name,
						LazyLoadingSongArtist: spotifySong.Artists[0].Name,
					}

					convertedSpotifyAlbum = append(convertedSpotifyAlbum, t)
				}

				return convertedSpotifyAlbum, SEARCH_ENGINE_SUCCESS, spotifyAlbum.Name, tracksToPush
			} else {
				for _, spotifySong := range spotifyAlbum.Tracks.Tracks {
					t := Track{
						AudioTrack:            track.Track{},
						Source:                SpotifySource,
						RequesterName:         author,
						LazyLoaded:            false,
						LazyLoadingSongTitle:  spotifySong.Name,
						LazyLoadingSongArtist: spotifySong.Artists[0].Name,
					}

					convertedSpotifyAlbum = append(convertedSpotifyAlbum, t)
				}

				return convertedSpotifyAlbum, SEARCH_ENGINE_SUCCESS, spotifyAlbum.Name, len(spotifyAlbum.Tracks.Tracks)
			}
		} else {
			return nil, SEARCH_ENGINE_ERROR, "", 0
		}
	} else if youtubeMatch == true {
		queryResult, err = client.LavalinkClient.LoadTracks(query.Of(userQuery))

		if err != nil {
			return nil, SEARCH_ENGINE_ERROR, "", 0
		}

		if len(queryResult.Tracks) == 0 {
			return nil, SEARCH_ENGINE_NOT_FOUND, "", 0
		}

		if queryResult.LoadType == "SEARCH_RESULT" || queryResult.LoadType == "TRACKS_LOADED" || queryResult.LoadType == "TRACK_LOADED" {
			t := Track{
				AudioTrack:    queryResult.Tracks[0],
				Source:        YoutubeSource,
				RequesterName: author,
				LazyLoaded:    true,
			}

			return []Track{t}, SEARCH_ENGINE_SUCCESS, "", 0
		} else if queryResult.LoadType == "PLAYLIST_LOADED" {
			tracksToPush := ((MaxPages * MaxSongsPerPage) - len(client.Queue.Queue))
			var convertedYoutubePlaylist []Track = make([]Track, 0)

			if len(queryResult.Tracks) > tracksToPush {
				for _, youtubeSong := range queryResult.Tracks[:tracksToPush] {
					t := Track{
						AudioTrack:    youtubeSong,
						Source:        YoutubeSource,
						RequesterName: author,
						LazyLoaded:    true,
					}

					convertedYoutubePlaylist = append(convertedYoutubePlaylist, t)
				}

				return convertedYoutubePlaylist, SEARCH_ENGINE_SUCCESS, queryResult.Playlist.Name, tracksToPush
			} else {
				for _, youtubeSong := range queryResult.Tracks {
					t := Track{
						AudioTrack:    youtubeSong,
						Source:        YoutubeSource,
						RequesterName: author,
						LazyLoaded:    true,
					}

					convertedYoutubePlaylist = append(convertedYoutubePlaylist, t)
				}

				return convertedYoutubePlaylist, SEARCH_ENGINE_SUCCESS, queryResult.Playlist.Name, len(queryResult.Tracks)
			}
		} else {
			return nil, SEARCH_ENGINE_ERROR, "", 0
		}
	} else {
		queryResult, err = client.LavalinkClient.LoadTracks(query.YouTube(userQuery))

		if err != nil {
			return nil, SEARCH_ENGINE_ERROR, "", 0
		}

		if len(queryResult.Tracks) == 0 {
			return nil, SEARCH_ENGINE_NOT_FOUND, "", 0
		}

		t := Track{
			AudioTrack:    queryResult.Tracks[0],
			Source:        YoutubeSource,
			RequesterName: author,
			LazyLoaded:    true,
		}

		return []Track{t}, SEARCH_ENGINE_SUCCESS, "", 0
	}
}

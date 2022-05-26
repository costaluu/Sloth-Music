package main

import (
	"fmt"
	"time"

	"github.com/gompus/snowflake"
	"github.com/lukasl-dev/waterlink/v2/track/query"
)

func (queue *Queue) Push(tracks ...Track) bool {
	queue.Mutex.Lock()
	defer queue.Mutex.Unlock()

	if len(queue.Queue) > (MaxSongsPerPage * MaxPages) {
		return false
	}

	queue.Queue = append(queue.Queue, tracks...)

	return true
}

func (queue *Queue) Pop() bool {
	queue.Mutex.Lock()
	defer queue.Mutex.Unlock()

	if queue.RepeatingMode == RepeatingModeOff && int(queue.CurrentIndex+1) >= len(queue.Queue) {
		return false
	} else if queue.RepeatingMode == RepeatingModeQueue {
		queue.CurrentIndex = (queue.CurrentIndex + 1) % (MaxPages * MaxSongsPerPage)
	} else if queue.RepeatingMode == RepeatingModeOff && int(queue.CurrentIndex+1) < len(queue.Queue) {
		queue.CurrentIndex = queue.CurrentIndex + 1
	}

	return true
}

func (client *Client) Playnext() PlayNextResult {
	if len(client.Queue.Queue) == 0 {
		return PLAY_NEXT_QUEUE_ENDED
	}

	if client.PlayingMessageID != "" {
		err := client.Session.ChannelMessageDelete(client.AnchorTextChannel, client.PlayingMessageID)

		if err != nil {
			fmt.Println("Failed to delete message: ", err.Error())
		}
	}

	track := client.Queue.Pop()

	if track == true {
		if client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoaded == false {
			if client.Queue.Queue[client.Queue.GetNextIndex()].Source == SpotifySource {
				queryResult, err := client.LavalinkClient.LoadTracks(query.YouTube(fmt.Sprintf("%s %s audio", client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoadingSongTitle, client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoadingSongArtist)))

				if err != nil || len(queryResult.Tracks) == 0 {
					client.EventMessage(fmt.Sprintf("Failed to play %s, skipping...", client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoadingSongTitle), COLOR_ERROR)
					return PLAY_NEXT_TRACK_ERROR
				}

				queryResult.Tracks[0].Info.Title = client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoadingSongTitle

				client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack = queryResult.Tracks[0]
				client.Queue.Queue[client.Queue.GetNextIndex()].LazyLoaded = true
			}
		}

		err := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).PlayTrack(client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack)

		if err != nil {
			client.EventMessage(fmt.Sprintf("Failed to play %s, skipping...", client.Queue.Queue[client.Queue.GetNextIndex()].AudioTrack.Info.Title), COLOR_ERROR)

			return PLAY_NEXT_TRACK_ERROR
		}

		client.IsPlaying = true

		return PLAY_NEXT_SUCCESS
	} else {
		return PLAY_NEXT_QUEUE_ENDED
	}
}

func (queue *Queue) GetPage(page int) []Track {
	return queue.Queue[MaxSongsPerPage*(page-1) : min(MaxSongsPerPage*page, len(queue.Queue))]
}

func (queue *Queue) PagesCount() int {
	return ceil(len(queue.Queue), 16)
}

func (queue *Queue) GetDurationString(lenght uint, isStream bool) string {
	if isStream == true {
		return "Live"
	}

	if lenght >= 86400000 {
		days := lenght / 86400000
		mod := lenght % 86400000
		hours := mod / 3600000
		mod = mod % 3600000
		minutes := mod / 60000
		mod = mod % 60000
		seconds := mod / 1000

		return fmt.Sprintf("%v day(s) and %02v:%02v:%02v", days, hours, minutes, seconds)
	} else {
		hours := lenght / 3600000
		mod := lenght % 3600000
		minutes := mod / 60000
		mod = mod % 60000
		seconds := mod / 1000

		if hours == 0 {
			return fmt.Sprintf("%02v:%02v", minutes, seconds)
		} else {
			return fmt.Sprintf("%02v:%02v:%02v", hours, minutes, seconds)
		}
	}
}

func (queue *Queue) GetNextIndex() int {
	return int(queue.CurrentIndex) % (MaxPages * MaxSongsPerPage)
}

func (queue *Queue) GetTotalQueueDurationString() string {
	if len(queue.Queue) == 0 {
		return "--:--"
	}

	var queueDuration uint = 0

	for _, song := range queue.Queue {
		var duration uint = 0

		if song.AudioTrack.Info.Stream == false {
			duration = song.AudioTrack.Info.Length
		}

		queueDuration = queueDuration + duration
	}

	return queue.GetDurationString(queueDuration, false)
}

func (queue *Queue) Move(from, to int) {
	queue.Mutex.Lock()
	defer queue.Mutex.Unlock()

	selectedTrack := queue.Queue[from]

	queue.Remove(from)

	var newQueue []Track

	if from < int(queue.CurrentIndex) {
		to -= 1
	}

	newQueue = append(newQueue, queue.Queue[:to]...)

	newQueue = append(newQueue, selectedTrack)

	newQueue = append(newQueue, queue.Queue[to:]...)

	queue.Queue = newQueue
}

func (queue *Queue) Remove(position int) {
	queue.Mutex.Lock()
	defer queue.Mutex.Unlock()

	queue.Queue = append(queue.Queue[:position], queue.Queue[position+1:]...)

	if position < int(queue.CurrentIndex) {
		queue.CurrentIndex -= 1
	}
}

func (client *Client) PageTextGenerator(pageNumber int) string {
	if len(client.Queue.Queue) == 0 {
		return "```css\n" + "No songs in queue 😔" + "\n```"
	}

	title := fmt.Sprintf("🎶 Queue List 🎶 %v song(s) | The %vth song is playing", len(client.Queue.Queue), client.Queue.CurrentIndex+1)

	repeatText := ""

	if client.Queue.RepeatingMode == RepeatingModeQueue {
		repeatText = fmt.Sprintf(" | Repeat: 🔁")
	} else if client.Queue.RepeatingMode == RepeatingModeSong {
		repeatText = fmt.Sprintf(" | Repeat: 🔂")
	}

	footer := fmt.Sprintf("Page [%v/%v] | Total duration: %s %s", pageNumber, client.Queue.PagesCount(), client.Queue.GetTotalQueueDurationString(), repeatText)

	songs := ""

	if pageNumber > 0 && pageNumber <= client.Queue.PagesCount() {
		page := client.Queue.GetPage(pageNumber)

		for i, track := range page {
			if track.RequesterName == "" {
				continue
			}

			isCurrent := ""

			if ((pageNumber-1)*MaxSongsPerPage)+i == int(client.Queue.CurrentIndex) {
				isCurrent = " 🎯"
			}

			songs += fmt.Sprintf("[%v]. %s - [%s] | request by %s%s\n", (pageNumber-1)*MaxSongsPerPage+(i+1), track.AudioTrack.Info.Title, client.Queue.GetDurationString(track.AudioTrack.Info.Length, track.AudioTrack.Info.Stream), track.RequesterName, isCurrent)
		}
	}

	return "```css\n" + "\n\n" + title + "\n\n" + songs + "\n" + footer + "\n```"
}

func (client *Client) BotClearState(leave bool) {
	if client.PlayingMessageID != "" {
		err := client.Session.ChannelMessageDelete(client.AnchorTextChannel, client.PlayingMessageID)

		if err != nil {
			fmt.Println("Failed to delete message: ", err.Error())
		}
	}

	client.Queue = Queue{
		CurrentIndex:  -1, // last indice
		Queue:         make([]Track, 0),
		RepeatingMode: RepeatingModeOff,
	}

	client.PlayingMessageID = ""

	err := client.LavalinkConnection.Guild(snowflake.MustParse(client.BotConfig.GuildID)).Stop()

	if err != nil {
		fmt.Println("Error during stop, ", err.Error())
	}

	client.IsPlaying = false

	if leave == true {
		client.AnchorTextChannel = ""
		client.AnchorVoiceChannel = ""

		err = client.Session.ChannelVoiceJoinManual(client.BotConfig.GuildID, "", false, true)

		if err != nil {
			fmt.Println("Fatal, ", err.Error())
		}
	}
}

func (client *Client) LazyLoading() {
	for index, track := range client.Queue.Queue {
		if track.LazyLoaded == true {
			continue
		}

		if client.Queue.Queue[index].Source == SpotifySource {
			queryResult, err := client.LavalinkClient.LoadTracks(query.YouTube(fmt.Sprintf("%s %s audio", client.Queue.Queue[index].LazyLoadingSongTitle, client.Queue.Queue[index].LazyLoadingSongArtist)))

			if err != nil || len(queryResult.Tracks) == 0 {
				continue
			}

			queryResult.Tracks[0].Info.Title = client.Queue.Queue[index].LazyLoadingSongTitle

			client.Queue.Queue[index].AudioTrack = queryResult.Tracks[0]
			client.Queue.Queue[index].LazyLoaded = true
		}
	}
}

func (client *Client) PlayTrack() {
	play := client.Playnext()

	if play == PLAY_NEXT_QUEUE_ENDED {
		client.IsPlaying = false

		if client.KeepAlive == false {
			go func() {
				time.Sleep(time.Duration(client.BotConfig.IdleTime) * time.Second)

				if client.KeepAlive == false {
					client.BotClearState(true)

					client.EventMessage(CustomInfo("I left due to inactivity"), COLOR_INFO)
				}
			}()
		}
	} else if play == PLAY_NEXT_TRACK_ERROR {
		i := client.Queue.CurrentIndex

		secondTry := client.Playnext()

		if secondTry == PLAY_NEXT_TRACK_ERROR {
			client.BotClearState(true)
		} else if play == PLAY_NEXT_QUEUE_ENDED {
			client.IsPlaying = false

			go func() {
				time.Sleep(time.Duration(client.BotConfig.IdleTime) * time.Second)

				if client.KeepAlive == false {
					client.BotClearState(true)

					client.EventMessage(CustomInfo("I left due to inactivity"), COLOR_INFO)
				}
			}()
		}

		client.Queue.Remove(int(i))
	}
}

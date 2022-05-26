# Sloth-Music

Dedicated discord music bot to The Language Sloth. Now written in GO!

### 📝 Requeriments

- [GOLANG](https://go.dev/dl/)
- [Lavalink](https://ci.fredboat.com/viewLog.html?buildId=8907&buildTypeId=Lavalink_Build&tab=artifacts&branch_Lavalink=refs%2Fheads%2Fdev)

#### 🧩 Extensions VS Code

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Editor Config](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Dir Tree](https://marketplace.visualstudio.com/items?itemName=Higurashi-kagome.dir-tree)

### 🌳 Directory Tree

```md
📦new-sloth-music
┣━ 📂lavalink
┃ ┣━ 📜clear.sh
┃ ┣━ 📜launch.sh
┃ ┗━ 📜Lavalink.jar
┣━ 📜.gitignore
┣━ 📜bot.go
┣━ 📜command_about.go
┣━ 📜command_clear.go
┣━ 📜command_help.go
┣━ 📜command_jump.go
┣━ 📜command_keep_alive.go
┣━ 📜command_leave.go
┣━ 📜command_lyrics.go
┣━ 📜command_move.go
┣━ 📜command_nowplaying.go
┣━ 📜command_pause.go
┣━ 📜command_ping.go
┣━ 📜command_play.go
┣━ 📜command_playnext.go
┣━ 📜command_queue.go
┣━ 📜command_remove.go
┣━ 📜command_repeat.go
┣━ 📜command_resume.go
┣━ 📜command_reverse.go
┣━ 📜command_seek.go
┣━ 📜command_shuffle.go
┣━ 📜command_skip.go
┣━ 📜command_sort.go
┣━ 📜command_upcomming.go
┣━ 📜command_uptime.go
┣━ 📜command_volume.go
┣━ 📜event_message_create.go
┣━ 📜event_ready.go
┣━ 📜event_voice_state_update.go
┣━ 📜event_voice_update.go
┣━ 📜go.mod
┣━ 📜player.go
┣━ 📜README.md
┣━ 📜search_engine.go
┣━ 📜types.go
┗━ 📜utils.go
```

### 🎉 Contribute

You will need a token for your test bot which can be obtained from the Discord Developer Portal. To start contributing make sure you have all the requirements listed above first clone the repository and use the following .env file

```
TOKEN=[BOT_TOKEN]
BOT_IDENTIFICATOR=0
BOT_ID=[BOT_DISCORD_ID]
LAVALINK_NAME=[LAVALINK_NAME]
LAVALINK_HOST=[LAVALINK_HOST]:[LAVALINK_PORT]
LAVALINK_PASS=[LAVALINK_PASS]
SPOTIFY_ID=[SPOTIFY_ID]
SPOTIFY_SECRET=[SPOTIFY_SECRET]
GENIUS_ACCESS_TOKEN=[GENIUS_ACCESS_TOKEN]
```

Before starting make sure the lavalink server is on (to do this enter the lavalink folder and run `java -jar Lavalink.jar`). After that in the project root folder run `go run .`. Finally, Good coding 🥰

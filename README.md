# Sloth-Music

Dedicated discord music bot to The Language Sloth.

### 📝 Requeriments

-   [Java 13](https://www.azul.com/downloads/?package=jdk)
-   [Node v16.13+](https://nodejs.org/pt-br/download/current/)
-   [Lavalink](https://ci.fredboat.com/viewLog.html?buildId=8907&buildTypeId=Lavalink_Build&tab=artifacts&branch_Lavalink=refs%2Fheads%2Fdev)

#### 🧩 Extensions VS Code

-   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
-   [Editor Config](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
-   [Dir Tree](https://marketplace.visualstudio.com/items?itemName=Higurashi-kagome.dir-tree)

### 🌳 Directory Tree

```md
📦Sloth-Music
┣━ 📂lavalink
┃ ┣━ 📜application.yml
┃ ┣━ 📜clear.sh
┃ ┣━ 📜launch.sh
┃ ┗━ 📜Lavalink.jar
┣━ 📂src
┃ ┣━ 📂Client
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂Commands
┃ ┃ ┣━ 📂common
┃ ┃ ┃ ┣━ 📜about.ts
┃ ┃ ┃ ┣━ 📜help.ts
┃ ┃ ┃ ┣━ 📜ping.ts
┃ ┃ ┃ ┗━ 📜uptime.ts
┃ ┃ ┗━ 📂music
┃ ┃ ┃ ┣━ 📜bassboost.ts
┃ ┃ ┃ ┣━ 📜clearstate.ts
┃ ┃ ┃ ┣━ 📜fairshuffle.ts
┃ ┃ ┃ ┣━ 📜jump.ts
┃ ┃ ┃ ┣━ 📜leave.ts
┃ ┃ ┃ ┣━ 📜lyrics.ts
┃ ┃ ┃ ┣━ 📜nowplaying.ts
┃ ┃ ┃ ┣━ 📜pause.ts
┃ ┃ ┃ ┣━ 📜play.ts
┃ ┃ ┃ ┣━ 📜playnext.ts
┃ ┃ ┃ ┣━ 📜queue.ts
┃ ┃ ┃ ┣━ 📜reboot.ts
┃ ┃ ┃ ┣━ 📜remove.ts
┃ ┃ ┃ ┣━ 📜repeat.ts
┃ ┃ ┃ ┣━ 📜resume.ts
┃ ┃ ┃ ┣━ 📜search.ts
┃ ┃ ┃ ┣━ 📜seek.ts
┃ ┃ ┃ ┣━ 📜shuffle.ts
┃ ┃ ┃ ┣━ 📜skip.ts
┃ ┃ ┃ ┣━ 📜stop.ts
┃ ┃ ┃ ┣━ 📜thread.ts
┃ ┃ ┃ ┗━ 📜toggle.ts
┃ ┣━ 📂Events
┃ ┃ ┣━ 📜interactionCreate.ts
┃ ┃ ┣━ 📜messageCreate.ts
┃ ┃ ┣━ 📜threadMembersUpdate.ts
┃ ┃ ┗━ 📜voiceStateUpdate.ts
┃ ┣━ 📂Interfaces
┃ ┃ ┣━ 📜BotState.ts
┃ ┃ ┣━ 📜Command.ts
┃ ┃ ┣━ 📜Event.ts
┃ ┃ ┣━ 📜index.ts
┃ ┃ ┗━ 📜MusicState.ts
┃ ┣━ 📂Logger
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂TaskQueue
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂Utils
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂VoiceHandler
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📜config.json
┃ ┗━ 📜index.ts
┣━ 📜.editorconfig
┣━ 📜.gitignore
┣━ 📜.prettierrc
┣━ 📜package.json
┣━ 📜README.md
┗━ 📜tsconfig.json
```

### 🎉 Contribute

You will need a token for your test bot which can be obtained from the Discord Developer Portal. To start contributing make sure you have all the requirements listed above first clone the repository and use the following .env file

```
IS_DEV_VERSION = true
BOT_TOKEN = YOUR_TOKEN_HERE
SPOTIFY_CLIENT_ID = YOUR_CLIENT_ID_HERE
SPOTIFY_CLIENT_SECRET = YOUR_SECRET_HERE
LAVALINK_HOST = localhost
LAVALINK_PASSWORD = test
LAVALINK_PORT = 2333
```

Before starting make sure the lavalink server is on (to do this enter the lavalink folder and run `java -jar Lavalink.jar`). After that in the project root folder run `npm run dev`. Finally, Good coding 🥰

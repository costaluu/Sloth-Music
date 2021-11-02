# Sloth-Music

Dedicated discord music bot using JDA music core.

### Requeriments

-   [Java 13](https://www.azul.com/downloads/?package=jdk)
-   [Node v16.13+](https://nodejs.org/pt-br/download/current/)
-   [Lavalink](https://ci.fredboat.com/viewLog.html?buildId=8907&buildTypeId=Lavalink_Build&tab=artifacts&branch_Lavalink=refs%2Fheads%2Fdev)

#### Extensions VS Code

-   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
-   [Editor Config](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
-   [Dir Tree](https://marketplace.visualstudio.com/items?itemName=Higurashi-kagome.dir-tree)

### Directory Tree

```md
📦Sloth-Music
┣ 📂lavalink
┃ ┣ 📜application.yml
┃ ┣ 📜launch.sh
┃ ┗ 📜Lavalink.jar
┣ 📂src
┃ ┣ 📂Client
┃ ┃ ┗ 📜index.ts
┃ ┣ 📂Commands
┃ ┃ ┣ 📂common
┃ ┃ ┃ ┣ 📜about.ts
┃ ┃ ┃ ┣ 📜help.ts
┃ ┃ ┃ ┣ 📜ping.ts
┃ ┃ ┃ ┗ 📜uptime.ts
┃ ┃ ┗ 📂music
┃ ┃ ┃ ┣ 📜clearstate.ts
┃ ┃ ┃ ┣ 📜fairshuffle.ts
┃ ┃ ┃ ┣ 📜jump.ts
┃ ┃ ┃ ┣ 📜leave.ts
┃ ┃ ┃ ┣ 📜nowplaying.ts
┃ ┃ ┃ ┣ 📜pause.ts
┃ ┃ ┃ ┣ 📜play.ts
┃ ┃ ┃ ┣ 📜queue.ts
┃ ┃ ┃ ┣ 📜remove.ts
┃ ┃ ┃ ┣ 📜repeat.ts
┃ ┃ ┃ ┣ 📜resume.ts
┃ ┃ ┃ ┣ 📜search.ts
┃ ┃ ┃ ┣ 📜shuffle.ts
┃ ┃ ┃ ┣ 📜skip.ts
┃ ┃ ┃ ┣ 📜stop.ts
┃ ┃ ┃ ┣ 📜thread.ts
┃ ┃ ┃ ┗ 📜toggle.ts
┃ ┣ 📂Events
┃ ┃ ┣ 📜messageCreate.ts
┃ ┃ ┗ 📜voiceStateUpdate.ts
┃ ┣ 📂Interfaces
┃ ┃ ┣ 📜BotState.ts
┃ ┃ ┣ 📜Command.ts
┃ ┃ ┣ 📜Event.ts
┃ ┃ ┣ 📜index.ts
┃ ┃ ┗ 📜MusicState.ts
┃ ┣ 📂Logger
┃ ┃ ┗ 📜index.ts
┃ ┣ 📂TaskQueue
┃ ┃ ┗ 📜index.ts
┃ ┣ 📂Utils
┃ ┃ ┗ 📜index.ts
┃ ┣ 📂VoiceHandler
┃ ┃ ┗ 📜index.ts
┃ ┣ 📜config.json
┃ ┗ 📜index.ts
┣ 📜.editorconfig
┣ 📜.gitignore
┣ 📜.prettierrc
┣ 📜package.json
┣ 📜README.md
┗ 📜tsconfig.json
```

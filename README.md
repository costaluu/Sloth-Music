# Sloth-Music

Dedicated discord music bot using JDA music core.

### Requeriments

-   [Java 13](https://www.azul.com/downloads/?package=jdk)
-   [Node v16+](https://nodejs.org/pt-br/download/current/)

### Extensions VS Code

-   [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
-   [Editor Config](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
-   [Dir Tree](https://marketplace.visualstudio.com/items?itemName=Higurashi-kagome.dir-tree)

### Directory Tree

```md
📦Sloth-Music
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
┃ ┃ ┃ ┣━ 📜fairshuffle.ts
┃ ┃ ┃ ┣━ 📜jump.ts
┃ ┃ ┃ ┣━ 📜leave.ts
┃ ┃ ┃ ┣━ 📜nowplaying.ts
┃ ┃ ┃ ┣━ 📜play.ts
┃ ┃ ┃ ┣━ 📜queue.ts
┃ ┃ ┃ ┣━ 📜remove.ts
┃ ┃ ┃ ┣━ 📜repeat.ts
┃ ┃ ┃ ┣━ 📜search.ts
┃ ┃ ┃ ┣━ 📜shuffle.ts
┃ ┃ ┃ ┣━ 📜skip.ts
┃ ┃ ┃ ┣━ 📜stop.ts
┃ ┃ ┃ ┣━ 📜thread.ts
┃ ┃ ┃ ┗━ 📜toggle.ts
┃ ┣━ 📂Events
┃ ┃ ┣━ 📜messageCreate.ts
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

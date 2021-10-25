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
┣━ 📂lavalink
┃ ┣━ 📜application.yml
┃ ┗━ 📜Lavalink.jar
┣━ 📂src
┃ ┣━ 📂Client
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂Commands
┃ ┃ ┣━ 📂common
┃ ┃ ┃ ┣━ 📜about.ts
┃ ┃ ┃ ┣━ 📜help.ts
┃ ┃ ┃ ┗━ 📜ping.ts
┃ ┃ ┗━ 📂music
┃ ┃ ┃ ┣━ 📜jump.ts
┃ ┃ ┃ ┣━ 📜leave.ts
┃ ┃ ┃ ┣━ 📜play.ts
┃ ┃ ┃ ┣━ 📜queue.ts
┃ ┃ ┃ ┣━ 📜remove.ts
┃ ┃ ┃ ┣━ 📜repeat.ts
┃ ┃ ┃ ┣━ 📜skip.ts
┃ ┃ ┃ ┣━ 📜stop.ts
┃ ┃ ┃ ┗━ 📜toggle.ts
┃ ┣━ 📂Events
┃ ┃ ┗━ 📜messageCreate.ts
┃ ┣━ 📂Interfaces
┃ ┃ ┣━ 📜BotState.ts
┃ ┃ ┣━ 📜Command.ts
┃ ┃ ┣━ 📜Event.ts
┃ ┃ ┣━ 📜index.ts
┃ ┃ ┗━ 📜MusicState.ts
┃ ┣━ 📂Logger
┃ ┃ ┗━ 📜index.ts
┃ ┣━ 📂Utils
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

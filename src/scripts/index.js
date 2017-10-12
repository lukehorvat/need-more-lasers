import Game from "./game";

let game = new Game(document.body, "models", "sounds", "fonts");
game.init().then(::game.start);

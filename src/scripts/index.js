import Game from "./game";

let game = new Game(document.body, "models", "sounds");
game.init().then(::game.start);

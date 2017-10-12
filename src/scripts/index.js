import Game from "./game";

let loadingElement = document.querySelector(".loading");
let gameElement = document.querySelector(".game");
let game = new Game(gameElement, "models", "sounds", "fonts");

game.init().then(() => {
  loadingElement.remove();
  game.start();
});

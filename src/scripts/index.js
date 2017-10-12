import Game from "./game";

let loadingElement = document.querySelector(".loading");
let instructionsElement = document.querySelector(".instructions");
let gameElement = document.querySelector(".game");
let game = new Game(gameElement, "models", "sounds", "fonts");

game.init().then(() => {
  loadingElement.remove();
  instructionsElement.style.display = "block";
  instructionsElement.querySelector("button").addEventListener("click", () => {
    instructionsElement.remove();
    game.start();
  }, false);
});

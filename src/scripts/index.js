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

// Google Analytics.
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");
ga("create", "UA-24505142-8", "auto");
ga("send", "pageview");

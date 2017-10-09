export default class Keyboard {
  constructor() {
    this.shift = false;
    this.space = false;
    this.up = false;
    this.left = false;
    this.down = false;
    this.right = false;
    this.w = false;
    this.a = false;
    this.s = false;
    this.d = false;

    window.addEventListener("keydown", event => {
      switch (event.key) {
        case "Shift":
          this.shift = true;
          break;
        case " ":
          this.space = true;
          break;
        case "ArrowUp":
          this.up = true;
          break;
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowDown":
          this.down = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "w":
          this.w = true;
          break;
        case "a":
          this.a = true;
          break;
        case "s":
          this.s = true;
          break;
        case "d":
          this.d = true;
          break;
      }
    }, false);

    window.addEventListener("keyup", event => {
      switch (event.key) {
        case "Shift":
          this.shift = false;
          break;
        case " ":
          this.space = false;
          break;
        case "ArrowUp":
          this.up = false;
          break;
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowDown":
          this.down = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "w":
          this.w = false;
          break;
        case "a":
          this.a = false;
          break;
        case "s":
          this.s = false;
          break;
        case "d":
          this.d = false;
          break;
      }
    }, false);
  }
}

const elementCanvas = document.querySelectorAll("canvas");
const canvas = elementCanvas[1];
canvas.style.display = "none";

const c = canvas.getContext("2d");

$(function () {
  // const canvas = document.getElementById("canvas");

  // Coletando a proprosão, lagura e comprimento
  let [width, height] = [$("#house").innerWidth(), $("#house").innerHeight()];
  const aspectRatio = width / height;
  const canvasWidth = width;
  const canvasHeigh = width / aspectRatio;

  // Dimensão do jogo
  canvas.width = canvasWidth;
  canvas.height = canvasHeigh;

  const collisionsMap = [];
  for (let i = 0; i < collisions.length; i += 15) {
    collisionsMap.push(collisions.slice(i, 15 + i));
  }

  const interactsMap = [];
  for (let i = 0; i < interacts.length; i += 15) {
    interactsMap.push(interacts.slice(i, 15 + i));
  }

  // localizao do eixo X e Y onde o troia inicia
  const offset = {
    x: -1650,
    y: -2700,
  };

  // Criando a hitbox de interação
  const interactionChangeMap = [];

  interactsMap.forEach((row, i) => {
    row.forEach((Symbol, j) => {
      if (Symbol === 4171)
        interactionChangeMap.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
          }),
        );
    });
  });

  //  Criando a hitbox de colisão
  const boundaries = [];
  collisionsMap.forEach((row, i) => {
    row.forEach((Symbol, j) => {
      if (Symbol === 4169)
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width + offset.x,
              y: i * Boundary.height + offset.y,
            },
          }),
        );
    });
  });

  // instanciando a image

  const image = new Image();
  image.src = "public/img/house.png"; // fonte image

  const houseForegroundImage = new Image();
  houseForegroundImage.src = "public/img/house-foreground.png";

  const playerForward = new Image();
  playerForward.src = "public/img/player-forward.png";

  const playerBack = new Image();
  playerBack.src = "public/img/player-back.png";

  const playerLeft = new Image();
  playerLeft.src = "public/img/player-left.png";

  const playerRight = new Image();
  playerRight.src = "public/img/player-right.png";

  // Inicando o controle com nenhuma tecla pressionada
  const keys = {
    w: {
      pressed: false,
    },
    s: {
      pressed: false,
    },
    a: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
    e: {
      pressed: false,
    },
  };

  // LaskKey para indentificar qual foi a ultima tecla pressionada
  let lastKey = "";

  // Interação do teclado com o jogo quando pressionado
  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "w":
        keys.w.pressed = true;
        lastKey = "w";
        break;
      case "s":
        keys.s.pressed = true;
        lastKey = "s";
        break;
      case "a":
        keys.a.pressed = true;
        lastKey = "a";
        break;
      case "d":
        keys.d.pressed = true;
        lastKey = "d";
        break;
      case "e":
        keys.e.pressed = true;
        lastKey = "e";
        break;
    }
  });

  // Mudar o estado do controle se não o boneco anda sozinho
  window.addEventListener("keyup", (e) => {
    switch (e.key) {
      case "w":
        keys.w.pressed = false;
        break;
      case "s":
        keys.s.pressed = false;
        break;
      case "a":
        keys.a.pressed = false;
        break;
      case "d":
        keys.d.pressed = false;
        break;
    }
  });

  // instanciando o sprite do boneco
  const player = new Sprite({
    position: {
      //                    {672 e 96} dimensao da imagem do personagem
      x: canvas.width / 2 - 672 / 4 / 2, // coordenada X,
      y: canvas.height / 2 - 96 / 2, // coordenada Y
    },
    image: playerBack, // fonte da imagem
    frames: {
      max: 3, // quantidade de sprites na imagem
    },
    sprites: {
      back: playerBack,
      right: playerRight, // Sprite do lado direito
      left: playerLeft, // Sprite do lado esquerdo
      forward: playerForward,
    },
  });

  // Posicionar a imagem do house no html
  const referencePoint = new Sprite({
    position: {
      x: offset.x,
      y: offset.y,
    },
    image: image,
  });

  // Posição do objetos sobre o personagem ex: arvore
  const houseForeground = new Sprite({
    position: {
      x: offset.x,
      y: offset.y,
    },
  });

  // Entepretar a hitbox de colisão
  function rectagularCollision({ rectangle1, rectangle2 }) {
    return (
      rectangle1.position.x - 19 + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x - 19 + rectangle2.width &&
      rectangle1.position.y <= rectangle2.position.y - 40 + rectangle2.height &&
      rectangle1.position.y - 19 + rectangle1.height >= rectangle2.position.y
    );
  }

  // Entepretar a hitbox de interação
  function rectagularInteract({ rectangle1, rectangle2 }) {
    return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    );
  }

  // Mover imagens no mapa
  const movables = [
    referencePoint,
    ...boundaries,
    houseForeground,
    ...interactionChangeMap,
  ];

  // Animação
  function animation() {
    window.requestAnimationFrame(animation);
    referencePoint.draw();

    boundaries.forEach((boundary) => {
      boundary.draw();
    });

    interactionChangeMap.forEach((interact) => {
      interact.draw();
    });

    player.draw();
    houseForeground.draw();

    let moving = true;
    player.moving = false;
    // Andar do personagem para frente
    if (keys.w.pressed && lastKey === "w") {
      player.moving = true;
      player.image = player.sprites.forward; // mudar de sprite
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectagularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y + 4,
              },
            },
          })
        ) {
          // myAlert("Colisao");
          moving = false;
          break;
        }
      }
      if (moving)
        movables.forEach((movable) => {
          movable.position.y += 4;
        });
    }
    // Andar do personagem para tras
    if (keys.s.pressed && lastKey === "s") {
      player.moving = true;
      player.image = player.sprites.back; // mudar de sprite
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectagularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y - 4,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving)
        movables.forEach((movable) => {
          movable.position.y -= 4;
        });
    }
    // Andar do personagem para esquerda
    if (keys.a.pressed && lastKey === "a") {
      player.moving = true;
      player.image = player.sprites.left; // mudar de sprite
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectagularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x + 4,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving)
        movables.forEach((movable) => {
          movable.position.x += 4;
        });
    }
    // Andar do personagem para Direita
    if (keys.d.pressed && lastKey === "d") {
      player.moving = true;
      player.image = player.sprites.right; // mudar de sprite
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectagularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x - 4,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving)
        movables.forEach((movable) => {
          movable.position.x -= 4;
        });
    }
    // Botao de interação
    if (keys.e.pressed) {
      for (let i = 0; i < interactionChangeMap.length; i++) {
        const interact = interactionChangeMap[i];
        if (
          rectagularCollision({
            rectangle1: player,
            rectangle2: interact,
          })
        ) {
          console.log("Change house");
          // plot_terminl();
          // plot_dialog();
        }
      }
    }
    keys.e.pressed = false;
  }

  animation();

  // Audio
  /* let clicked = false;
  addEventListener("click", () => {
    if (!clicked) {
      audio.Map.play();
      clicked = true;
    }
  }); */
});

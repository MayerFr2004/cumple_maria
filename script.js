window.addEventListener("DOMContentLoaded", () => {
  // ======== Globos animados ========
  const colores = ["#ff5c5c", "#ffd93b", "#ad5cff", "#5cffad", "#ff5ca6", "#5c7bff", "#ffba5c"];

  function crearGlobo() {
    const globo = document.createElement("div");
    globo.classList.add("globo");
    globo.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
    globo.style.left = Math.random() * 100 + "vw";
    globo.style.animationDuration = 5 + Math.random() * 6 + "s";
    globo.style.filter = `drop-shadow(0 0 6px ${globo.style.backgroundColor})`;
    document.body.appendChild(globo);
    setTimeout(() => { globo.remove(); }, 11000);
  }
  setInterval(crearGlobo, 500);

  // ======== Canvas: torta y velas ========
  const canvas = document.getElementById('velasCanvas');
  const ctx = canvas.getContext('2d');

  function dibujarTorta() {
    // Parte superior (cubierta)
    ctx.fillStyle = '#ffb6c1';
    ctx.strokeStyle = '#a33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(250, 120, 180, 60, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Cuerpo (cilindro con degradado)
    let gradTorta = ctx.createLinearGradient(0, 120, 0, 250);
    gradTorta.addColorStop(0, '#ffdde0');
    gradTorta.addColorStop(0.5, '#fcbecb');
    gradTorta.addColorStop(1, '#f6a5b3');

    ctx.fillStyle = gradTorta;
    ctx.beginPath();
    ctx.moveTo(70, 120);
    ctx.lineTo(70, 250);
    ctx.bezierCurveTo(250, 320, 430, 250, 430, 120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base inferior sombreada
    ctx.fillStyle = '#e28';
    ctx.beginPath();
    ctx.ellipse(250, 250, 180, 40, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Glaseado tipo goteo
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 90; x <= 410; x += 40) {
      ctx.moveTo(x, 130);
      ctx.bezierCurveTo(x + 5, 140, x - 5, 160, x, 170);
    }
    ctx.stroke();
  }

  function dibujarVela(x, y, llamaOn = true) {
    const velaWidth = 30;
    const velaHeight = 100;

    // Cuerpo
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, y - velaHeight, velaWidth, velaHeight);
    ctx.fill();
    ctx.stroke();

    // Volumen
    let grad = ctx.createLinearGradient(x, y - velaHeight, x + velaWidth, y);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.3)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y - velaHeight, velaWidth, velaHeight);

    if (!llamaOn) return;

    // Llama
    const llamaX = x + velaWidth / 2;
    const llamaY = y - velaHeight;
    const llamaHeight = 45;
    const llamaWidth = 25;

    let gradLlama = ctx.createRadialGradient(llamaX, llamaY - 10, 5, llamaX, llamaY - 20, 20);
    gradLlama.addColorStop(0, 'rgba(255, 255, 102, 1)');
    gradLlama.addColorStop(0.3, 'rgba(255, 204, 0, 0.8)');
    gradLlama.addColorStop(1, 'rgba(255, 153, 0, 0)');

    ctx.fillStyle = gradLlama;
    ctx.beginPath();
    ctx.ellipse(llamaX, llamaY - 15, llamaWidth / 2, llamaHeight / 1.7, 0, 0, 2 * Math.PI);
    ctx.fill();
  }

  let llamaScale = 1;
  let scaleStep = 0.02;
  let velasEncendidas = true;

  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarTorta();

    const velasCantidad = 5;
    const velaAncho = 30;
    const espacio = 40;
    const totalAncho = (velasCantidad - 1) * espacio;
    const baseX = 250 - totalAncho / 2;
    const baseY = 110;

    llamaScale += scaleStep;
    if (llamaScale > 1.1 || llamaScale < 0.9) scaleStep = -scaleStep;

    for (let i = 0; i < velasCantidad; i++) {
      ctx.save();
      ctx.translate(baseX + i * espacio, baseY);
      ctx.scale(llamaScale, llamaScale);
      dibujarVela(-velaAncho / 2, 0, velasEncendidas);
      ctx.restore();
    }

    requestAnimationFrame(animar);
  }

  animar(); // ← ¡Este llamado es esencial!

  // ======= Música y foto clic =======
  const musica = document.getElementById('musicaCumple');
  const foto = document.getElementById('foto');

  foto.addEventListener('click', () => {
    if (musica.paused) {
      musica.play();
    } else {
      musica.pause();
    }
  });

  // ====== Speech Recognition ======
  const statusDiv = document.getElementById('status');
  const velasMsg = document.getElementById('velasApagadasMsg');

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const reconocimiento = new SpeechRecognition();

  reconocimiento.lang = 'es-ES';
  reconocimiento.continuous = true;
  reconocimiento.interimResults = false;

  reconocimiento.onstart = () => {
    statusDiv.textContent = "Escuchando... Di 'Feliz cumpleaños María'";
  };

  reconocimiento.onerror = (e) => {
    statusDiv.textContent = "Error de reconocimiento: " + e.error;
  };

  reconocimiento.onresult = (event) => {
    const resultados = event.results;
    const ultimo = resultados[resultados.length - 1];
    const texto = ultimo[0].transcript.trim().toLowerCase();

    if (texto.includes("feliz cumpleaños maría") || texto.includes("feliz cumple maría")) {
      statusDiv.textContent = "¡Feliz cumpleaños María detectado! 🎉";
      if (musica.paused) musica.play();

      if (!velasEncendidas) {
        velasEncendidas = true;
        velasMsg.textContent = "";
      }

      const mensajeVoz = new SpeechSynthesisUtterance("Feliz cumpleaños María, muchas felicidades");
      mensajeVoz.lang = 'es-ES';
      speechSynthesis.speak(mensajeVoz);

    } else if (texto.includes("apaga las velas") || texto.includes("apagar velas")) {
      velasEncendidas = false;
      velasMsg.textContent = "Las velas están apagadas 🕯️";
      statusDiv.textContent = "Velas apagadas. Di 'enciende las velas' para prenderlas.";
    } else if (texto.includes("enciende las velas") || texto.includes("prende las velas")) {
      velasEncendidas = true;
      velasMsg.textContent = "";
      statusDiv.textContent = "Velas encendidas. ¡Feliz celebración!";
    }
  };

  reconocimiento.start();
});

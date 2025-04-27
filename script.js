const chatContainer = document.getElementById("chat-container");
const inputForm = document.getElementById("input-form");
const userInput = document.getElementById("user-input");
const datePicker = document.getElementById("date-picker");

let step = 0;
let formData = {};

const preguntas = [
  { tipo: "texto", mensaje: "¡Hola! 😊 ¿Cuál es tu nombre?", campo: "nombre" },
  { tipo: "texto", mensaje: "¿Cuál es tu RUT?", campo: "rut", validar: validarRUT },
  { tipo: "texto", mensaje: "¿Cuál es tu correo electrónico?", campo: "correo", validar: validarEmail },
  {
    tipo: "opciones",
    mensaje: "¿Cuál es tu previsión?",
    opciones: ["Isapre", "Fonasa", "Particular"],
    campo: "prevision"
  },
  {
    tipo: "opciones",
    mensaje: "¿Cuál es tu Isapre?",
    opciones: ["Banmédica", "Cruz Blanca", "Consalud", "Colmena", "Nueva Más Vida", "Vida Tres", "Esencial"],
    campo: "isapre",
    condicion: (datos) => datos.prevision === "Isapre"
  },
  {
    tipo: "checkbox",
    mensaje: "¿En qué clínicas te gustaría atenderte? (Puedes elegir hasta 3)",
    opciones: [
      "Clínica Alemana",
      "Clínica Las Condes",
      "Clínica UC San Carlos",
      "Clínica UC Christus",
      "Clínica MEDS",
      "Clínica Santa María",
      "Clínica Indisa",
      "Clínica Redsalud Providencia",
      "Clínica Redsalud Vitacura",
      "Clínica Dávila Recoleta",
      "Clínica Dávila Vespucio",
      "Clínica Bupa",
      "Otra",
    ],
    campo: "clinicas"
  },
  { tipo: "texto", mensaje: "¿Qué especialidad estás buscando?", campo: "especialidad" },
  {
    tipo: "opciones",
    mensaje: "¿Tienes un médico en mente?",
    opciones: ["Sí", "No"],
    campo: "tieneMedico"
  },
  {
    tipo: "texto",
    mensaje: "Escribe el nombre del médico",
    campo: "medico",
    condicion: (datos) => datos.tieneMedico === "Sí"
  },
  {
    tipo: "opciones",
    mensaje: "¿Prefieres la hora lo antes posible o en una fecha específica?",
    opciones: ["Lo antes posible", "Fecha específica"],
    campo: "preferenciaHora"
  },
  {
    tipo: "fecha",
    mensaje: "Selecciona la fecha que prefieras:",
    campo: "fecha",
    condicion: (datos) => datos.preferenciaHora === "Fecha específica"
  },
  {
    tipo: "opciones",
    mensaje: "¿Prefieres horario mañana o tarde?",
    opciones: ["Mañana", "Tarde"],
    campo: "horario"
  },
  {
    tipo: "final",
    mensaje: "¡Gracias! Hemos recibido tu solicitud. 💙 Pronto te contactaremos con las opciones disponibles."
  }
];

function agregarMensaje(texto, clase) {
  const msg = document.createElement("div");
  msg.className = `message ${clase}`;
  msg.textContent = texto;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function mostrarPregunta() {
  const pregunta = preguntas[step];
  if (!pregunta) return;

  if (pregunta.condicion && !pregunta.condicion(formData)) {
    step++;
    mostrarPregunta();
    return;
  }

  let texto = pregunta.mensaje;

  userInput.style.display = "none";
  datePicker.style.display = "none";

  if (pregunta.tipo === "texto" || pregunta.tipo === "opciones") {
    agregarMensaje(texto + (pregunta.tipo === "opciones" ? "\n" + pregunta.opciones.map((op, i) => `${i + 1}) ${op}`).join("\n") : ""), "bot");
    userInput.value = "";
    userInput.style.display = "block";
    userInput.focus();
  } else if (pregunta.tipo === "fecha") {
    agregarMensaje(texto, "bot");
    datePicker.value = "";
    datePicker.style.display = "block";
  } else if (pregunta.tipo === "checkbox") {
    agregarMensaje(texto, "bot");
    const opcionesHtml = pregunta.opciones.map((op, i) => {
      return `<label><input type="checkbox" name="clinica" value="${op}"> ${op}</label>`;
    }).join("<br>");
    const wrapper = document.createElement("div");
    wrapper.className = "message bot";
    wrapper.innerHTML = opcionesHtml;
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

inputForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const pregunta = preguntas[step];
  let respuesta = "";

  if (pregunta.tipo === "fecha") {
    if (!datePicker.value) return;
    const partes = datePicker.value.split("-");
    if (partes.length !== 3) return;
    const fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    respuesta = fechaFormateada;

    if (pregunta.campo) {
      formData[pregunta.campo] = fechaFormateada;
    }
  } else if (pregunta.tipo === "checkbox") {
    const seleccionados = Array.from(document.querySelectorAll('input[name="clinica"]:checked')).map(input => input.value);
    if (seleccionados.length === 0 || seleccionados.length > 3) {
      agregarMensaje("Selecciona entre 1 y 3 clínicas, por favor.", "bot");
      return;
    }
    respuesta = seleccionados;
  } else {
    respuesta = userInput.value.trim();
    if (!respuesta) return;
  }

  if (pregunta.tipo === "opciones") {
    const index = parseInt(respuesta);
    if (isNaN(index) || index < 1 || index > pregunta.opciones.length) {
      agregarMensaje("Por favor responde con el número correspondiente a una opción válida.", "bot");
      return;
    }
    respuesta = pregunta.opciones[index - 1];
  }

  if (pregunta.validar && !pregunta.validar(respuesta)) {
    agregarMensaje("El formato ingresado no es válido. Intenta nuevamente.", "bot");
    return;
  }

  if (pregunta.tipo === "checkbox") {
    agregarMensaje(respuesta.join(", "), "user");
  } else {
    agregarMensaje(respuesta, "user");
  }

  if (pregunta.campo && pregunta.tipo !== "fecha") {
    formData[pregunta.campo] = respuesta;
  }

  if (pregunta.campo === "preferenciaHora" && respuesta === "Lo antes posible") {
    agregarMensaje("¡Gracias! Hemos recibido tu solicitud. 💙 Pronto te contactaremos con las opciones disponibles.", "bot");
    inputForm.style.display = "none";
    return;
  }

  if (pregunta.tipo === "final") {
    agregarMensaje(pregunta.mensaje, "bot");
    inputForm.style.display = "none";
    return;
  }

  step++;
  const siguientePregunta = preguntas[step];

  if (siguientePregunta?.tipo === "final") {
    agregarMensaje(siguientePregunta.mensaje, "bot");
    inputForm.style.display = "none";
    return;
  }

  mostrarPregunta();
});

mostrarPregunta();

// ✅ VALIDACIÓN DE EMAIL
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ VALIDACIÓN DE RUT CHILENO
function validarRUT(rut) {
  rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalc = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();

  return dv === dvCalc;
}




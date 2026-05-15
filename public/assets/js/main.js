// ===== CONFIGURAÇÃO DA API =====
const API_URL = 'https://concurso-api-o0pu.onrender.com/api';  // 

// ===== ELEMENTOS DO DOM =====
const form = document.querySelector("#search-form");
const input = document.querySelector("#concurso-input");
const button = form.querySelector("#button-search");
const result = document.querySelector("#result");

const formPalpite = document.querySelector("#palpite-form");
const inputPalpite = document.querySelector("#palpite-input");
const resultPalpite = document.querySelector("#palpite-result");
const buttonPalpite = formPalpite.querySelector("#button-palpite");

// ===== FUNÇÕES AUXILIARES =====
function formatDate(value) {
  const [year, month, day] = String(value).split("T")[0].split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });
}

function setMessage(message) {
  result.innerHTML = `
    <div class="message">${message}</div>
    `;
}

function setMessagePalpite(message) {
  resultPalpite.innerHTML = `
    <div class="message">${message}</div>
    `;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// ===== RENDERIZAÇÃO DOS DADOS =====
function renderDraw(data) {
  result.innerHTML = `
    <article class="draw">
      <header class="draw-header">
        <div>
          <h2 class="draw-title">Concurso ${data.concurso}</h2>
          <span class="draw-date">${formatDate(data.data_do_sorteio)}</span>
        </div>
        <strong>
          ${Number(data.ganhadores_6_acertos) == 0 ? "Acumulou" : "Teve ganhador"}
        </strong>
      </header>
      <ul class="balls">
        <li class="ball">${data.bola1}</li>
        <li class="ball">${data.bola2}</li>
        <li class="ball">${data.bola3}</li>
        <li class="ball">${data.bola4}</li>
        <li class="ball">${data.bola5}</li>
        <li class="ball">${data.bola6}</li>
      </ul>
      <div class="details">
        <div class="detail">
          <strong>6 acertos</strong>
          ${data.ganhadores_6_acertos} ganhador(es), ${formatCurrency(data.rateio_6_acertos)}
        </div>
        <div class="detail">
          <strong>5 acertos</strong>
          ${data.ganhadores_5_acertos} ganhador(es), ${formatCurrency(data.rateio_5_acertos)}
        </div>
        <div class="detail">
          <strong>4 acertos</strong>
          ${data.ganhadores_4_acertos} ganhador(es), ${formatCurrency(data.rateio_4_acertos)}
        </div>
        <div class="detail">
          <strong>Estimativa</strong>
          ${formatCurrency(data.estimativa_premio)}
        </div>
      </div>
    </article>
  `;
}

function renderPalpite(data) {
  let bolas = "";
  for (const bola of data.palpite) {
    bolas += `<li class="ball">${bola}</li>`;
  }

  resultPalpite.innerHTML = `
    <article class="draw">
      <header class="draw-header">
        <div>
          <h2 class="draw-title">Resultado do palpite</h2>
          <span class="draw-date">${data.concursos_consultados} concurso(s) consultado(s)</span>
        </div>
      </header>
      <ul class="balls">${bolas}</ul>
      <div class="details">
        <div class="detail">
          <strong>6 acertos</strong>
          ${data.concursos_com_6_acertos} concurso(s)
        </div>
        <div class="detail">
          <strong>5 acertos</strong>
          ${data.concursos_com_5_acertos} concurso(s)
        </div>
        <div class="detail">
          <strong>4 acertos</strong>
          ${data.concursos_com_4_acertos} concurso(s)
        </div>
      </div>
    </article>
  `;
}

// ===== FUNÇÕES DA API (CORRIGIDAS) =====
async function loadConcurso(concurso = "") {
  // 🔧 CORRIGIDO: usa API_URL completa
  const endpoint = concurso ? `${API_URL}/${concurso}` : API_URL;
  button.disabled = true;
  setMessage("Carregando...");

  await delay(2000);

  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) {
      setMessage("Não foi possível conectar à API");
      return;
    }
    renderDraw(data);
  } catch (error) {
    console.error("Erro:", error);
    setMessage("Não foi possível conectar à API");
  } finally {
    button.disabled = false;
  }
}

async function conferePalpite(numeros) {
  const numerosString = numeros
    .replace(/\s/g, ",")
    .replace(/[^\d,]/g, "")
    .replace(/,+/g, ",")
    .split(",");

  const dezenas = [];
  for (const nro of numerosString) {
    if (Number(nro) >= 1 && Number(nro) <= 60) {
      dezenas.push(Number(nro));
    }
  }
  
  if (dezenas.length < 6 || dezenas.length > 12) {
    setMessagePalpite(
      "O palpite deve conter entre 6 e 12 dezenas com valores de 1 a 60."
    );
    return;
  }

  const numerosQuery = dezenas.join(",");
  // 🔧 CORRIGIDO: usa API_URL completa
  const endpoint = `${API_URL}/palpite?numeros=${numerosQuery}`;

  buttonPalpite.disabled = true;
  setMessagePalpite("Carregando...");

  await delay(500);

  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      setMessagePalpite(data.message || "Não foi possível consultar as dezenas");
      return;
    }

    renderPalpite(data);
  } catch (error) {
    console.error("Erro:", error);
    setMessagePalpite("Não foi possível conectar à API.");
  } finally {
    buttonPalpite.disabled = false;
  }
}

// ===== EVENT LISTENERS =====
form.addEventListener("submit", function (event) {
  event.preventDefault();
  loadConcurso(input.value.trim());
});

formPalpite.addEventListener("submit", function (event) {
  event.preventDefault();
  conferePalpite(inputPalpite.value.trim());
});

// ===== INICIALIZAÇÃO =====
loadConcurso();
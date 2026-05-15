const pool = require("../database/db");

async function last(req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM megasena
      ORDER BY concurso DESC
      LIMIT 1
    `);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Nenhum concurso cadastrado" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function getConcurso(req, res) {
  const { concurso } = req.params;

  if (/^\d+$/.test(concurso) === false) {
    return res.status(400).json({ message: "Concurso deve ser um número" });
  }

  try {
    const result = await pool.query(
      `
      SELECT * FROM megasena
      WHERE concurso = $1
    `,
      [concurso]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Nenhum concurso cadastrado" });
    }

    res.json(result.rows[0]);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

async function conferirPalpite(req, res) {
  const { numeros } = req.query;

  if (!numeros) {
    return res.status(400).json({ message: "Números não informados" });
  }

  const numerosString = numeros
    .replace(/[^\d,]/g, "")
    .replace(/,+/g, ",")
    .split(",");

  const palpite = [];

  for (const nro of numerosString) {
    const numero = Number(nro);

    if (numero >= 1 && numero <= 60) {
      palpite.push(numero);
    }
  }

  if (palpite.length < 6 || palpite.length > 12) {
    return res.status(400).json({
      message:
        "O palpite deve conter entre 6 e 12 dezenas com valores de 1 a 60.",
    });
  }

  let acertos4 = 0;
  let acertos5 = 0;
  let acertos6 = 0;

  try {
    const result = await pool.query(`
      SELECT concurso, bola1, bola2, bola3, bola4, bola5, bola6
      FROM megasena
    `);

    for (const concurso of result.rows) {
      const dezenasSorteadas = [
        concurso.bola1,
        concurso.bola2,
        concurso.bola3,
        concurso.bola4,
        concurso.bola5,
        concurso.bola6,
      ];

      let quantidadeAcertos = 0;

      for (const dezenaSorteada of dezenasSorteadas) {
        for (const dezenaPalpite of palpite) {
          if (dezenaSorteada === dezenaPalpite) {
            quantidadeAcertos++;
          }
        }
      }

      if (quantidadeAcertos === 4) {
        acertos4++;
      } else if (quantidadeAcertos === 5) {
        acertos5++;
      } else if (quantidadeAcertos === 6) {
        acertos6++;
      }
    }

    return res.json({
      palpite,
      concursos_consultados: result.rowCount,
      concursos_com_4_acertos: acertos4,
      concursos_com_5_acertos: acertos5,
      concursos_com_6_acertos: acertos6,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
}

module.exports = {
  last,
  getConcurso,
  conferirPalpite,
};
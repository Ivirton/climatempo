require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Use ?url=http://site.com" });

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // TEMPERATURA
    const tempMin = $("#min-temp-1").text().trim();
    const tempMax = $("#max-temp-1").text().trim();

    // CHUVA
    const chuva = $('li:contains("Chuva") span._margin-l-5').text().trim();

    // VENTO
    const vento = $('li:contains("Vento") div._flex').text().replace(/\s+/g, " ").trim();

    // UMIDADE
    const umidadeMin = $('li:contains("Umidade") span.-gray-light').eq(0).text().trim();
    const umidadeMax = $('li:contains("Umidade") span.-gray-light').eq(1).text().trim();

    // SOL
    const solText = $('li:contains("Sol")').text().replace(/\s+/g, " ").trim();
    const [nascerSol, porSol] = solText.match(/\d{2}:\d{2}:\d{2}/g);

    return res.json({
      temperatura: { min: tempMin, max: tempMax },
      chuva,
      vento,
      umidade: { min: umidadeMin, max: umidadeMax },
      sol: { nascer: nascerSol, por: porSol }
    });

  } catch (err) {
    return res.status(500).json({ error: "Erro ao acessar a URL" });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Rodando na porta ${PORT} — http://localhost:${PORT}/scrape?url=`)
);

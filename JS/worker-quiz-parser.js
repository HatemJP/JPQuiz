self.onmessage = (e) => {
  const { csvText } = e.data;
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines
    .shift()
    .split(",")
    .map((h) => h.replace(/"/g, "").trim());

  const words = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const values = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((v) => v.replace(/^"|"$/g, "").trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] || ""));

    words.push({
      kanji: obj["Question"] || "",
      reading: obj["Answer"] ? obj["Answer"].split(",") : [],
      furigana: (obj["Furigana"] || "").split("."),
      meaning: obj["Meaning"] || "",
      example: obj["Example"] || "",
      translation: obj["Translation"] || "",
      romaji: (obj["Answer"] || "").replace(/,/g, ""), // wanakana not in worker
      vocabWords: obj["VocabWords"]
        ? obj["VocabWords"].split(",").map((w) => w.trim())
        : [],
    });
  }

  postMessage({ words });
};
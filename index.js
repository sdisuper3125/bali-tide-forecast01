const fs = require("fs");
const https = require("https");

const weatherURL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091?Authorization=CWA-6725D166-52CC-467C-8BDF-89C43234E460&format=JSON&locationName=八里區";
const tideURL = "https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-A0021-001?Authorization=CWA-6725D166-52CC-467C-8BDF-89C43234E460&format=JSON";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function getWeekendDates() {
  const weekends = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 6 || d.getDay() === 0) {
      weekends.push(d.toISOString().split("T")[0]);
    }
  }
  return weekends;
}

function renderHTML(weatherData, tideData) {
  const weekends = getWeekendDates();
  const location = weatherData.records.locations[0].location[0];
  const wx = location.weatherElement.find(el => el.elementName === "Wx");
  const maxT = location.weatherElement.find(el => el.elementName === "MaxT");
  const minT = location.weatherElement.find(el => el.elementName === "MinT");
  const tides = tideData.records.location.find(loc => loc.locationName.includes("八里"));

  let html = `
  <html>
    <head>
      <meta charset="UTF-8">
      <title>八里週末預報</title>
    </head>
    <body>
      <h1>八里區未來週末預報</h1>
  `;

  weekends.forEach(date => {
    const wxEntry = wx.time.find(t => t.startTime.startsWith(date));
    const max = maxT.time.find(t => t.startTime.startsWith(date));
    const min = minT.time.find(t => t.startTime.startsWith(date));
    const tideEntries = tides.time.filter(t => t.dataTime.startsWith(date));

    html += `<h3>${date}</h3>`;
    if (wxEntry && max && min) {
      html += `<p>🌤 天氣：${wxEntry.elementValue[0].value}</p>`;
      html += `<p>🌡 氣溫：${min.elementValue[0].value}–${max.elementValue[0].value}°C</p>`;
    }

    if (tideEntries.length > 0) {
      html += `<p>🌊 潮汐時間：</p><ul>`;
      tideEntries.forEach(tide => {
        html += `<li>${tide.dataTime} - ${tide.value}</li>`;
      });
      html += `</ul>`;
    } else {
      html += `<p>🌊 無潮汐資料</p>`;
    }
  });

  html += `
    </body>
  </html>
  `;
  return html;
}

(async () => {
  try {
    const weatherData = await fetchJSON(weatherURL);
    const tideData = await fetchJSON(tideURL);
    const html = renderHTML(weatherData, tideData);
    fs.writeFileSync("index.html", html);
    console.log("✅ index.html 已產生");
  } catch (e) {
    console.error("❌ 錯誤：", e);
  }
})();

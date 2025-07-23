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

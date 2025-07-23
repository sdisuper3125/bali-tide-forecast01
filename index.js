const fs = require("fs");

let html = `<html>
  <head>
    <meta charset="UTF-8">
    <title>測試頁面</title>
  </head>
  <body>
    <h1>這是測試頁面</h1>
    <p>GitHub Actions 成功產生 index.html 🎉</p>
  </body>
</html>`;

fs.writeFileSync("index.html", html);
console.log("✅ index.html 已成功產生");

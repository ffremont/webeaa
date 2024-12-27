#!/usr/bin/env node
import express, { Express, Request, Response } from "express";
import Watcher from "node-watch";
import { existsSync, readFileSync, statSync, readdirSync } from "fs";

console.log(`%c
  ------------------------------------------------------------------

  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓████████▓▒░▒▓███████▓▒░░▒▓████████▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░  
  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░ ░▒▓███████▓▒░░▒▓██████▓▒░ ░▒▓████████▓▒░▒▓████████▓▒░ 
  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
   ░▒▓█████████████▓▒░░▒▓████████▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ 
                                                                                                                                                       
  
  Bienvenue sur webEaa, le visualiseur de .jpg issue de votre logiciel d'imagerie astronomique.
  

  Auteur: Florent FREMONT
  ------------------------------------------------------------------
`);
const WATERMARK =
  process.argv[2] || "EAA 9/10 Août 2024 | Florent FREMONT | tetesenlair.net";
const EXTENSION = ".jpg";
let eaaJpg = null;
const app: Express = express();

app.use(express.static(__dirname + "/../public"));
const port = process.env.PORT || 3000;

app.get("/binary", (req: Request, res: Response) => {
  if (eaaJpg) {
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "max-age=10");
    res.send(eaaJpg);
  }else{
    res.status(404);
    res.send();
  }
});

app.get("/live", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Refresh" content="30">
    <title>EAA</title>
    <style>
    html,body{
      background:black;
    }
    .download{
      position: fixed !important;
      right: 2rem;
      bottom: 2rem;
    }
      #container{
      text-align:center;
      }

      #container p{
      font-size: 1.4rem;
      padding: 2rem 1rem;
      }
    #container img{
      max-width: 100%;
      max-height: 100vh;
    }
    </style>
    <link
        rel="stylesheet"
        href="./bulma.min.css"
      >
</head>
<body>
    <div id="container">
    ${!eaaJpg ? '<p>La séance va bientôt démarrer.</p>': ''}
    </div>
    <a ${!eaaJpg ?  'disabled': ''} id="download" href="/binary" download="${new Date().getTime()}-tetes-en-lair-visuel-assiste.jpg" class="download button is-link">Télécharger</a>
    <script src="./watermark.min.js"></script>
    <script>
        watermark(['/binary'])
            .image(watermark.text.lowerRight('${WATERMARK}', '50px Josefin Slab', '#fff', 0.5))
            .then(function (img) {
                document.getElementById('container').appendChild(img);
                fetch(img.getAttribute('src')).
                    then(r => r.blob()).then(b => {
                        document.getElementById('download').setAttribute('href', URL.createObjectURL(b));
                    });
            });
    </script>
</body>

</html>
    `);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

Watcher(".", { recursive: false }, (evt, filename) => {
  const lowerFilename = filename.toLowerCase();

  if (!lowerFilename.endsWith(EXTENSION) || !existsSync(filename)) {
    return;
  }

  console.log("⚡️ Nouvelle image détectée");
  eaaJpg = Buffer.from(readFileSync(filename, "binary"), "binary");
});

/**
 * main func
 */
const main = () => {
  const jpgs = readdirSync(".")
    .filter((file) => file.toLowerCase().endsWith(EXTENSION))
    .map((file) => {
      const stat = statSync(file);
      return { file, ctimeMs: stat.ctimeMs };
    });
  jpgs.sort(function (a, b) {
    return b.ctimeMs - a.ctimeMs;
  });
  if (jpgs.length) {
    console.log(`👋 Fichier "${jpgs[0].file}" est le plus récent`);
    eaaJpg = Buffer.from(readFileSync(jpgs[0].file, "binary"), "binary");
  }

  console.log(`\n\n👉 Rendez-vous sur http://localhost:${port}/live`);
};

main();

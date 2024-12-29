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
                                                                                                                                                       
  
  Bienvenue sur webEaa, le visualiseur de .png issue de votre logiciel d'imagerie astronomique.
  

  Auteur: Florent FREMONT
  ------------------------------------------------------------------
`);
const WATERMARK =
  process.argv[2] || "EAA $at | $name | F. FREMONT | tetesenlair.net";
const EXTENSION = ".png";
let eaaJpg = null;
let ctimeMs = null;
let imageName = '';
const app: Express = express();

app.use(express.static(__dirname + "/../public"));
const port = process.env.PORT || 3000;

app.get("/binary", (req: Request, res: Response) => {
  if (eaaJpg) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
    res.setHeader("x-ctimems", `${ctimeMs}`);
    res.setHeader("x-imagename", imageName);
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
    <a ${!eaaJpg ?  'disabled': ''} id="download" href="/binary" download="${new Date().getTime()}-tetes-en-lair-eaa.png" class="download button is-link">Télécharger</a>
    <script src="./watermark.min.js"></script>
    <script>
      fetch('/binary')
        .then(async r => ({
          bin: await r.blob(),
          ctimeMs: r.headers.get('x-ctimeMs'),
          imagename: r.headers.get('x-imagename')
        }))
        .then(b => {
              document.getElementById('download').setAttribute('href', URL.createObjectURL(b.bin));

              const ctimeMs = 
               watermark(['/binary'])
                .image(watermark.text.lowerRight('${WATERMARK}'
                    .replace('$at', new Date(parseInt(b.ctimeMs,10)).toLocaleString())
                    .replace('$name', b.imagename)
                  , '50px Josefin Slab', '#fff', 0.5))
                .then(function (img) {
                    document.getElementById('container').appendChild(img);
                    
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
  const stat = statSync(filename);
  ctimeMs = stat.ctimeMs;
  imageName = filename.replace(".png", "");
  eaaJpg = Buffer.from(readFileSync(filename, "binary"), "binary");
});

/**
 * main func
 */
const main = () => {
  const pngs = readdirSync(".")
    .filter((file) => file.toLowerCase().endsWith(EXTENSION))
    .map((file) => {
      const stat = statSync(file);
      return { file, ctimeMs: stat.ctimeMs };
    });
  pngs.sort(function (a, b) {
    return b.ctimeMs - a.ctimeMs;
  });
  if (pngs.length) {
    console.log(`👋 Fichier "${pngs[0].file}" est le plus récent`);
    eaaJpg = Buffer.from(readFileSync(pngs[0].file, "binary"), "binary");
    imageName = pngs[0].file.replace('.png', '');
    ctimeMs = pngs[0].ctimeMs;
  }

  console.log(`\n\n👉 Rendez-vous sur http://localhost:${port}/live`);
};

main();

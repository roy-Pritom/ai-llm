import { createServer, type IncomingMessage, type ServerResponse } from "http";
import * as fs from "fs";
import * as path from "path";
import { parse } from "url";
import { IncomingForm, type File as FormidableFile } from "formidable";
import { parsePdf } from "./controller/controller";
import cors from "cors";

const PORT = process.env.PORT;
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const setCorsHeaders = (res: ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const requestHandler = (req: IncomingMessage, res: ServerResponse) => {
  const { pathname } = parse(req.url || "", true);
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === "/upload" && req.method === "POST") {
    const form = new IncomingForm({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "File upload failed" }));
        return;
      }

      const uploadedFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;
      if (!uploadedFile) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No file uploaded" }));
        return;
      }

      parsePdf(fields, uploadedFile)
        .then((result) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "File uploaded and parsed successfully",
              filePath: uploadedFile.filepath,
              result: result,
            })
          );
        })

        .catch((error) => {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "PDF parsing failed",
              details: error.message,
            })
          );
        });
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route Not Found" }));
  }
};

const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

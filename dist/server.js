"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const url_1 = require("url");
const formidable_1 = require("formidable");
const controller_1 = require("./controller/controller");
const PORT = process.env.PORT;
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}
const setCorsHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://scarce-godwcscdevernment.surge.sh");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
};
// const setCorsHeaders = (res: ServerResponse) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://q-mcq-generate-ui.vercel.app/"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
// };
const requestHandler = (req, res) => {
    const { pathname } = (0, url_1.parse)(req.url || "", true);
    setCorsHeaders(res);
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }
    if (pathname === "/upload" && req.method === "POST") {
        const form = new formidable_1.IncomingForm({
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
            (0, controller_1.parsePdf)(fields, uploadedFile)
                .then((result) => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    message: "File uploaded and parsed successfully",
                    filePath: uploadedFile.filepath,
                    result: result,
                }));
            })
                .catch((error) => {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: "PDF parsing failed",
                    details: error.message,
                }));
            });
        });
    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route Not Found" }));
    }
};
const server = (0, http_1.createServer)(requestHandler);
server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

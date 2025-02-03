"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePdf = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const langdetect_1 = require("langdetect");
const services_1 = require("./services");
const promises_1 = require("fs/promises");
const parsePdf = async (fields, uploadedFile) => {
    try {
        const fieldData = {
            type: fields.questionType[0],
            action: fields.difficulty[0],
        };
        console.log("Fields Data:", fieldData);
        const dataBuffer = await fs_1.default.promises.readFile(uploadedFile.filepath);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        // Delete the uploaded PDF file When Text Parse
        await (0, promises_1.unlink)(uploadedFile.filepath);
        console.log("Pdf Text", data.text.slice(0, 50));
        console.log("Field", fieldData);
        // Detect the language of the PDF text ---
        const detectedLang = (0, langdetect_1.detect)(data.text);
        const language = detectedLang && detectedLang[0] && detectedLang[0].lang === "bn"
            ? "Bengali"
            : "English";
        // Generate questions based on the type
        if (fieldData.type === "MCQ") {
            const mcqs = await (0, services_1.generateMCQs)(data.text, language, fieldData.action);
            return { type: "MCQ", data: mcqs, language };
        }
        else if (fieldData.type === "Short Question") {
            const shortQuestions = await (0, services_1.generateShortQuestions)(data.text, language, fieldData.action);
            return { type: "Short Question", data: shortQuestions, language };
        }
        else if (fieldData.type === "Long Question") {
            const longQuestions = await (0, services_1.generateLongQuestions)(data.text, language, fieldData.action);
            return { type: "Long Question", data: longQuestions, language };
        }
        else {
            throw new Error("Invalid type specified");
        }
    }
    catch (error) {
        //Delete Pdf When Error Trow
        await (0, promises_1.unlink)(uploadedFile.filepath);
        console.error("Error parsing fields:", error);
        throw new Error("Invalid fields data. Please ensure the fields are correctly formatted.");
    }
};
exports.parsePdf = parsePdf;

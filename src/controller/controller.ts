import fs from "fs";
import pdf from "pdf-parse";
import { detect } from "langdetect";
import { File as FormidableFile } from "formidable";
import {
  generateLongQuestions,
  generateMCQs,
  generateShortQuestions,
} from "./services";
import { unlink } from "fs/promises";

interface PdfFields {
  type: "MCQ" | "Short Question" | "Long Question";
  action: "easy" | "medium" | "hard";
}

export const parsePdf = async (fields: any, uploadedFile: FormidableFile) => {
  try {
    const fieldData: PdfFields = {
      type: fields.questionType[0] as PdfFields["type"],
      action: fields.difficulty[0] as PdfFields["action"],
    };

    console.log("Fields Data:", fieldData);

    const dataBuffer = await fs.promises.readFile(uploadedFile.filepath);
    const data = await pdf(dataBuffer);

    // Delete the uploaded PDF file When Text Parse
    await unlink(uploadedFile.filepath);
    console.log("Pdf Text", data.text.slice(0, 50));
    console.log("Field", fieldData);

    // Detect the language of the PDF text ---
    const detectedLang = detect(data.text);
    const language =
      detectedLang && detectedLang[0] && detectedLang[0].lang === "bn"
        ? "Bengali"
        : "English";

    // Generate questions based on the type
    if (fieldData.type === "MCQ") {
      const mcqs = await generateMCQs(data.text, language, fieldData.action);
      return { type: "MCQ", data: mcqs, language };
    } else if (fieldData.type === "Short Question") {
      const shortQuestions = await generateShortQuestions(
        data.text,
        language,
        fieldData.action
      );
      return { type: "Short Question", data: shortQuestions, language };
    } else if (fieldData.type === "Long Question") {
      const longQuestions = await generateLongQuestions(
        data.text,
        language,
        fieldData.action
      );
      return { type: "Long Question", data: longQuestions, language };
    } else {
      throw new Error("Invalid type specified");
    }
  } catch (error) {
    //Delete Pdf When Error Trow
    await unlink(uploadedFile.filepath);
    console.error("Error parsing fields:", error);
    throw new Error(
      "Invalid fields data. Please ensure the fields are correctly formatted."
    );
  }
};

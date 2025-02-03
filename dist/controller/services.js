"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLongQuestions = exports.generateShortQuestions = exports.generateMCQs = void 0;
exports.parseMCQs = parseMCQs;
exports.parseQuestions = parseQuestions;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not defined");
}
const googleAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const generateMCQs = async (text, language, questionType) => {
    console.log("Generating MCQs...", questionType);
    const prompt = `Generate 5 multiple-choice ${questionType} questions (MCQs) in ${language} from the following text:

  ${text}
  
  Each MCQ should have the following format:
  
  Question: [The question text]
  Options:
  A) [Option A text]
  B) [Option B text]
  C) [Option C text]
  D) [Option D text]
  Answer: [The correct option letter (A, B, C, or D)]
  
  Ensure the questions are relevant to the text and the answers are accurate.`;
    const generatedText = await generateAIContent(prompt);
    return parseMCQs(generatedText);
};
exports.generateMCQs = generateMCQs;
const generateAIContent = async (prompt) => {
    const model = googleAI.getGenerativeModel({ model: "gemini-pro" });
    const request = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 800,
        },
    };
    const response = await model.generateContent(request);
    const generatedText = response.response.text();
    if (!generatedText) {
        throw new Error("No text generated from AI model");
    }
    return generatedText;
};
function parseMCQs(text) {
    console.log("MCQ Text", text);
    const mcqs = [];
    const mcqRegex = /Question:\s*(.+?)\nOptions:\nA\)\s*(.+?)\nB\)\s*(.+?)\nC\)\s*(.+?)\nD\)\s*(.+?)\nAnswer:\s*([A-D])/gs;
    let match;
    while ((match = mcqRegex.exec(text)) !== null) {
        mcqs.push({
            question: match[1].trim(),
            options: {
                A: match[2].trim(),
                B: match[3].trim(),
                C: match[4].trim(),
                D: match[5].trim(),
            },
            answer: match[6].trim(),
        });
    }
    console.log("MCQ Question:", mcqs);
    return mcqs.length > 0 ? mcqs : text;
}
const generateShortQuestions = async (text, language, questionType) => {
    console.log("Generating Short Questions...", questionType);
    const prompt = `Generate 5 short ${questionType} questions and answers in ${language} from the following text:

  ${text}
  
  Each question and answer should have the following format:
  
  Question: [The question text]
  Answer: [The correct answer]
  
  Ensure the questions are relevant to the text and the answers are accurate and concise.`;
    const generatedText = await generateAIContent(prompt);
    return parseQuestions(generatedText);
};
exports.generateShortQuestions = generateShortQuestions;
function parseQuestions(text) {
    const questions = [];
    const questionRegex = /\*\*Question \d+:\*\*\s*([\s\S]+?)\s*\*\*Answer:\*\*\s*([\s\S]+?)(?=\n\*\*Question|$)/g;
    let match;
    while ((match = questionRegex.exec(text)) !== null) {
        questions.push({
            question: match[1].trim(),
            answer: match[2].trim(),
        });
    }
    return questions;
}
const generateLongQuestions = async (text, language, questionType) => {
    console.log("Generating Long Questions...", questionType);
    const prompt = `Generate 5 long ${questionType} questions and answers in ${language} from the following text:

  ${text}
  
  Each question and answer should have the following format:
  
  Question: [The question text]
  Answer: [The correct answer]
  
  Ensure the questions are relevant to the text and the answers are accurate and concise.`;
    const generatedText = await generateAIContent(prompt);
    return parseQuestions(generatedText);
};
exports.generateLongQuestions = generateLongQuestions;

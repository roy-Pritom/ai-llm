import {
  GoogleGenerativeAI,
  type GenerateContentRequest,
} from "@google/generative-ai";
import dotenv from "dotenv";

export interface MCQ {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
}

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not defined");
}

const googleAI = new GoogleGenerativeAI(apiKey);

export const generateMCQs = async (
  text: string,
  language: string,
  questionType: string
): Promise<MCQ[]> => {
  const prompt = `Generate 10 multiple-choice ${questionType} questions (MCQs) in ${language} from the following text:

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

const generateAIContent = async (prompt: string): Promise<string> => {
  const model = googleAI.getGenerativeModel({ model: "gemini-pro" });
  const request: GenerateContentRequest = {
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

export function parseMCQs(text: string): MCQ[] {
  const mcqs: MCQ[] = [];
  const mcqRegex =
    /Question:\s*(.+?)\s*\nOptions:\s*\nA\)\s*(.+?)\s*\nB\)\s*(.+?)\s*\nC\)\s*(.+?)\s*\nD\)\s*(.+?)\s*\nAnswer:\s*([A-D])/gs;

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

  return mcqs;
}

export interface Question {
  question: string;
  answer: string;
}

export const generateShortQuestions = async (
  text: string,
  language: string,
  questionType: string
): Promise<Question[]> => {
  const prompt = `Generate 10 short ${questionType} questions and answers in ${language} from the following text:

  ${text}
  
  Each question and answer should have the following format:
  
  Question: [The question text]
  Answer: [The correct answer]
  
  Ensure the questions are relevant to the text and the answers are accurate and concise.`;

  const generatedText = await generateAIContent(prompt);
  return parseQuestions(generatedText);
};

export function parseQuestions(text: string): Question[] {
  const questions: Question[] = [];
  const questionRegex =
    /\*\*Question \d+:\*\*\s*([\s\S]+?)\s*\*\*Answer:\*\*\s*([\s\S]+?)(?=\n\*\*Question|$)/g;

  let match;
  while ((match = questionRegex.exec(text)) !== null) {
    questions.push({
      question: match[1].trim(),
      answer: match[2].trim(),
    });
  }
  return questions;
}

export interface Question {
  question: string;
  answer: string;
}
export const generateLongQuestions = async (
  text: string,
  language: string,
  questionType: string
) => {
  const prompt = `Generate 10 long ${questionType} questions and answers in ${language} from the following text:

  ${text}
  
  Each question and answer should have the following format:
  
  Question: [The question text]
  Answer: [The correct answer]
  
  Ensure the questions are relevant to the text and the answers are accurate and concise.`;

  const generatedText = await generateAIContent(prompt);
  return parseQuestions(generatedText);
};

import { GoogleGenAI, Type, Content, Chat } from "@google/genai";
import type { Language, Answer, Message } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    shortTeaching: {
      type: Type.STRING,
      description: 'A very short, 1-2 line teaching or summary of the scriptural wisdom.'
    },
    scriptureReference: {
      type: Type.STRING,
      description: 'The specific citation for the scripture, e.g., "Bhagavad Gita 2.47".'
    },
    scripturePassage: {
      type: Type.STRING,
      description: 'The relevant scriptural passage or a close paraphrase.'
    },
    relatableExample: {
      type: Type.STRING,
      description: 'A detailed, vivid, and emotionally relatable story or modern example (about 3-5 sentences long) that brings the teaching to life and helps the user feel its relevance in their own experience.'
    },
    actionableSteps: {
      type: Type.ARRAY,
      description: 'Exactly 3 practical, actionable steps the user can take.',
      items: {
        type: Type.STRING
      }
    }
  },
  required: ['shortTeaching', 'scriptureReference', 'scripturePassage', 'relatableExample', 'actionableSteps']
};

export const getScripturalAnswer = async (messages: Message[], language: Language): Promise<Answer | null> => {
  const systemInstruction = `
    You are Sanatani Gyan, an assistant that provides compassionate, culturally authentic life guidance using Hindu scriptures.
    A user is asking questions in ${language}.

    Your task is to act as if you have retrieved relevant passages from scriptures like the Bhagavad Gita, Ramayana, Upanishads, etc. Based on this simulated retrieval, generate an answer in ${language} that includes the following five components in a structured JSON format:
    1. shortTeaching: A concise teaching (1-2 lines) rooted in scripture.
    2. scriptureReference: A specific citation (e.g., "Gita 2.47").
    3. scripturePassage: The scriptural passage or a clear paraphrase.
    4. relatableExample: A detailed, vivid, and emotionally relatable story or modern example (about 3-5 sentences long) that brings the teaching to life and helps the user feel its relevance in their own experience.
    5. actionableSteps: A list of exactly three practical action steps.

    Important rules:
    - The entire response must be in the specified language: ${language}.
    - When answering a follow-up question, use the context of the previous answer to provide a more relevant response.
    - The tone must be compassionate, respectful, and non-judgmental.
    - Do NOT provide medical, legal, or financial advice. If the question is in these categories, provide a disclaimer and suggest seeking a professional.
    - The output MUST conform to the provided JSON schema.
  `;

  const history: Content[] = messages.slice(0, -1).map(message => {
    if (message.role === 'user') {
      return { role: 'user', parts: [{ text: message.text }] };
    }
    // It's a model message
    if (message.answer) {
      // Send the structured answer back as context. This is what the model "said".
      return { role: 'model', parts: [{ text: JSON.stringify(message.answer) }] };
    }
    // Fallback for error messages or other text-based model messages
    return { role: 'model', parts: [{ text: message.text }] };
  });

  const currentQuestion = messages[messages.length - 1].text;

  try {
    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: history,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const response = await chat.sendMessage({ message: currentQuestion });
    const text = response.text.trim();
    const parsedJson = JSON.parse(text);

    // Basic validation
    if (parsedJson.shortTeaching && parsedJson.actionableSteps?.length === 3) {
      return parsedJson as Answer;
    } else {
      console.error("Parsed JSON does not match Answer schema:", parsedJson);
      return null;
    }

  } catch (error) {
    console.error("Error fetching or parsing Gemini response:", error);
    return null;
  }
};
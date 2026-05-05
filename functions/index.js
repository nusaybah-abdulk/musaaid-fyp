/*global process */
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import OpenAI from "openai";

//httpsError allows fb errors into nice errors
//onCall makes callable FB function
//request has other fields made by DB so need request.data

export const checkArabicSentence = onCall(async (request) => {

    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      //only access setence if requesr data exisrs
  const sentence = request.data?.sentence;

 //rejects missing output
  if (!sentence || typeof sentence !== "string") {
    throw new HttpsError("invalid-argument", "A valid sentence is required.");
  }

  //removes extra whitespace
  const trimmedSentence = sentence.trim();

  if (!trimmedSentence) {
    throw new HttpsError("invalid-argument", "Sentence cannot be empty.");
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You are an Arabic language feedback assistant for learners.
Your job is to check one short Arabic sentence.

Return only structured JSON with:
- isCorrect: boolean
- correctedSentence: string
- Explanation: string
- Topics to Revise: string

Rules:
- Keep explanations short and clear.
- If the sentence is already acceptable, set correctedSentence to the original sentence.
- Do not return markdown.
- Do not return extra commentary.
          `,
        },
        {
          role: "user",
          content: `Check this Arabic sentence: ${trimmedSentence}`,
        },
      ], // tells model to return data in this format
      text: {
        format: {
          type: "json_schema",
          name: "arabic_sentence_feedback",
          schema: {
            type: "object",
            additionalProperties: false, // don't allow extra fields
            properties: {
              isCorrect: {type: "boolean"},
              correctedSentence: {type: "string"},
              englishExplanation: {type: "string"},
              revisionTopics: {type: "string"},
            },
            required: [
              "isCorrect",
              "correctedSentence",
              "englishExplanation",
              "revisionTopics",
            ],
          },
        },
      },
    });

   // prevent parsing empty text
    if (!response.output_text) {
        throw new Error("OpenAI returned empty output_text.");
      }
      //turns into JS object
      let parsed;
      try {
        parsed = JSON.parse(response.output_text);
      } catch (parseError) {
        //logs google cloud functions
        logger.error("Invalid JSON from model", {
          outputText: response.output_text,
          parseError: parseError?.message || String(parseError),
        });
        throw new Error("Model output was not valid JSON.");
      }
      
    return parsed;
  } catch (error) {
    logger.error("Sentence checker failed", error);
    throw new HttpsError("internal", "Failed to check the sentence.");
  }
});




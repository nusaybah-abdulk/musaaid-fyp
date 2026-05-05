import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

//intialsing backend function
const functions = getFunctions(app, "us-central1");
//lets frontend call backend 
const checkArabicSentence = httpsCallable(functions, "checkArabicSentence");

//takes sentence return answer
export async function analyseArabicSentence(sentence) {
  const result = await checkArabicSentence({ sentence });
  return result.data;
}
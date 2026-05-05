import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { lesson1Questions } from "../content/book1questions";

export async function uploadBook1Questions() {
  try {
    console.log("Starting question upload...");

    for (const question of lesson1Questions) {
      const seededQ = {
        ...question,
        seeded: true,
      };

      await setDoc(
        doc(db, "questions", question.id),
        seededQ,
        { merge: true }
      );
      console.log(`Uploaded question: ${question.id}`);
    }

    console.log("Book 1 questions uploaded successfully.");
  } catch (error) {
    console.error("Error uploading questions:", error);
  }
}
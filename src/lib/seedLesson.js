import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { book1Lessons } from "../content/book1lessons";

export async function seedBook1LessonMetadata() {
  for (const lesson of book1Lessons) {
    const { id, ...lessonData } = lesson;
    // point to the lessons DB at the specifi id given, merge to prevent rewrites
    await setDoc(doc(db, "lessons", id), lessonData, { merge: true });
  }

  console.log("Book 1 lesson uploaded");
}
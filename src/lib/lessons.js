import { collection, getDocs, orderBy, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchLessonsByBook(bookId) {
  const lessonsRef = collection(db, "lessons");
  const q = query(
    lessonsRef,
    where("bookId", "==", bookId),
    orderBy("number")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
export async function fetchLessonById(lessonId) {
  const lessonRef = doc(db, "lessons", lessonId);
  const snapshot = await getDoc(lessonRef);

  // just incase lesson doesnt exist
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
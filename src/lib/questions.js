import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function fetchQuestionsByLessonId(lessonId) {
  const q = query(collection(db, "questions"), where("lessonId", "==", lessonId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

//same but multipple
export async function fetchQuestionsByLessonIds(lessonIds) {
  if (!lessonIds.length) return [];

// get all qs (FS querys using in only returns 10 max)
  const snapshot = await getDocs(collection(db, "questions"));

  //filter by lesson id
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((q) => lessonIds.includes(q.lessonId));
}
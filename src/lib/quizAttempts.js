import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";


// saving attempts to db
export async function saveQuizAttempt(attemptData) {
  //adding timestampt to attempt
  const docData = {
    ...attemptData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "quizAttempts"), docData);
  return docRef.id; //confirm saved
}

//getting attempts from DB by user
export async function fetchQuizAttemptsByUser(userId) {
  const q = query(
    collection(db, "quizAttempts"),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
import { collection, getDocs, getDoc, orderBy, query, doc } from "firebase/firestore";
import { db } from "./firebase";


//gets all books order by number
export async function fetchBooks() {
  const booksRef = collection(db, "books");
  const q = query(booksRef, orderBy("number"));
  const snapshot = await getDocs(q);

  // turn FS docs into normal objects (must include ID for URL)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}


//simialr but only for one book
export async function fetchBookById(bookId) {
  const bookRef = doc(db, "books", bookId);
  const snapshot = await getDoc(bookRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchBooks } from "../lib/books";
import BackButton from "../components/BackButton";

//choose a book page

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      const data = await fetchBooks();
      setBooks(data);
      setLoading(false);
    }

    loadBooks();
  }, []);

  if (loading) {
    return <div className="page">Loading books...</div>;
  }

  return (
    <div className="page">
      <BackButton to="/dashboard" label="View Dashboard" />

      <header className="page-header">
        <h1 className="page-title">Select a Book</h1>
        <p className="muted">
          Select a book to revise key vocabulary and grammar through structured
          lessons and quizzes.
        </p>
      </header>

      <div className="book-grid">
        {books.map((book) => {
          const isAvailable = book.published !== false;

          return (
            <div
              key={book.id}
              className={`card book-card ${isAvailable ? "card-hover" : "card-disabled"}`}
            >
              <div className="book-card-top">
                <div className="book-number">{book.number}</div>
              </div>

              <div className="book-card-body">
                <h2 className="book-title">{book.titleEn}</h2>

                <p className="arabic-text book-ar">{book.titleAr}</p>

                {isAvailable ? (
                  <Link to={`/books/${book.id}/lessons`}>
                    <button className="btn">View Lessons</button>
                  </Link>
                ) : (
                  <button className="btn btn-ghost" disabled>
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="card book-card book-card--coming card-disabled ">
          <div className="book-card-top">
            <div className="book-number">ꗃ</div>
          </div>

          <div className="book-card-body">
            <h2 className="book-title">More Books Coming</h2>

            <p className="book-desc">
              Ajrumiyyah, Bayna Yadayk, and many more ...
            </p>

            <button className="btn btn-ghost" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
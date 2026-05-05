
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams} from "react-router-dom";
import { fetchBookById } from "../lib/books";
import { fetchLessonsByBook } from "../lib/lessons";
import BackButton from "../components/BackButton";
import { useAuthUser } from "../lib/auth";

//shows list of lessons in each book + select big wuiz

export default function BookLessonsList() {
  const user = useAuthUser();
  const { bookId } = useParams(); //get bookid from url
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [bookLessons, setBookLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1);
  const [adaptiveCount, setAdaptiveCount] = useState(10);
  const [wrongCount, setWrongCount] = useState(10);

  const isPreview = !user;
  

  useEffect(() => {
    async function loadBookPage() {
      try {
        setLoading(true);
        //fetching book and lesson data same time
        const [bookData, lessonsData] = await Promise.all([
          fetchBookById(bookId),
          fetchLessonsByBook(bookId),
        ]);

        setBook(bookData);
        setBookLessons(lessonsData);

        const quizReadyLessons = lessonsData.filter(
          (lesson) => lesson.published !== false && lesson.hasQuiz !== false
        );

        // used for the drop down for adaptive quiz make sure it only shows an avaible range
        if (quizReadyLessons.length > 0) {
          setFrom(quizReadyLessons[0].number); //number from first avavbile lesson
          setTo(quizReadyLessons[quizReadyLessons.length - 1].number);
        } else {
          setFrom(1);
          setTo(1);
        }
      } catch (error) {
        console.error("Failed to load book lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBookPage();
  }, [bookId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading lessons...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="page">
        <p className="muted">Book not found.</p>
      </div>
    );
  }

  // lesson page exists i.e the content
  const availableLessons = bookLessons.filter(
    (lesson) => lesson.published !== false && lesson.hasContent !== false
  );

  // questions are avaible
  const quizReadyLessons = bookLessons.filter(
    (lesson) => lesson.published !== false && lesson.hasQuiz !== false
  );

  const hasLessons = availableLessons.length > 0;
  const hasQuizLessons = quizReadyLessons.length > 0;
  const rangeValid = from <= to;

  function goToSignup() {
    navigate("/signup");
  }

  function startAdaptiveQuiz() {
    if (isPreview) {
      goToSignup();
      return;
    }

    if (!hasQuizLessons || !rangeValid) return;

    // goes to quiz page whre the filtering will take place based on this URL
    navigate(
      `/books/${bookId}/quiz?from=${from}&to=${to}&mode=adaptive&count=${adaptiveCount}`
    );
  }
  // goes to quiz page whre the filtering will take place based on this URL

  function startWrongAnswersQuiz() {
    if (isPreview) {
      goToSignup();
      return;
    }

    if (!hasQuizLessons) return;

    navigate(`/books/${bookId}/quiz?mode=wrong&count=${wrongCount}`);
  }

  function handleLockedLessonClick(e) {
    e.preventDefault();
    goToSignup();
  }

  return (
    <div className="page">
      <BackButton to={`/books`} label="Back to Books" />

      <header className="page-header">
        <h1 className="page-title">{book.titleEn}</h1>
        <p className="arabic-text page-title-ar">{book.titleAr}</p>
      </header>

      {isPreview && (
        <section className="card preview-banner">
          <div className="preview-banner-row">
            <div>
              <h2 className="card-title">Preview Mode</h2>
              <p className="muted card-subtitle">
              Explore the platform. Create an account to access lessons, complete quizzes, and track your progress.
              </p>
            </div>

            <div className="preview-actions">
              <Link to="/signup" className="btn btn-primary">
                Create account
              </Link>
              <Link to="/login" className="btn">
                Log in
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className={`card range-card ${isPreview ? "preview-locked-card" : "card-hover"}`}>
        <div>
          <h2 className="card-title">Adaptive Quiz</h2>
          <p className="muted card-subtitle">
            Choose a lesson range and question count.
          </p>
        </div>

        <div className="range-controls">
          <div className="field">
            <label htmlFor="fromLesson">From</label>
            <select
              id="fromLesson"
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              disabled={!hasQuizLessons || isPreview}
            >
              {quizReadyLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.number}>
                  {lesson.number}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="toLesson">To</label>
            <select
              id="toLesson"
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              disabled={!hasQuizLessons || isPreview}
            >
              {quizReadyLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.number}>
                  {lesson.number}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="adaptiveQuestionCount">Questions</label>
            <select
              id="adaptiveQuestionCount"
              value={adaptiveCount}
              onChange={(e) => setAdaptiveCount(Number(e.target.value))}
              disabled={!hasQuizLessons || isPreview}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="quiz-mode-actions">
          <button
            className="btn btn-primary"
            onClick={startAdaptiveQuiz}
            disabled={!hasQuizLessons || !rangeValid}
          >
            {isPreview ? "Sign up to start quiz" : "Start Adaptive Quiz"}
          </button>
        </div>

        {!rangeValid && (
          <p className="muted range-error">From must be ≤ To.</p>
        )}
      </section>

      <section className={`card range-card ${isPreview ? "preview-locked-card" : "card-hover"}`}>
        <div>
          <h2 className="card-title">Wrong Answers Only</h2>
          <p className="muted card-subtitle">
            Revise questions you previously got wrong in this book.
          </p>
        </div>

        <div className="range-controls">
          <div className="field">
            <label htmlFor="wrongQuestionCount">Questions</label>
            <select
              id="wrongQuestionCount"
              value={wrongCount}
              onChange={(e) => setWrongCount(Number(e.target.value))}
              disabled={!hasQuizLessons || isPreview}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="quiz-mode-actions">
          <button
            className="btn btn-primary"
            onClick={startWrongAnswersQuiz}
            disabled={!hasQuizLessons}
          >
            {isPreview ? "Sign up to start quiz" : "Start Wrong Answers Quiz"}
          </button>
        </div>
      </section>

      <h2 className="section-title">Select a Lesson</h2>

      {!hasLessons && <p className="muted">No lessons yet.</p>}

      <div className="lesson-list">
        {bookLessons.map((lesson) => {
          const canOpenLesson =
            lesson.published !== false && lesson.hasContent !== false;

          const lessonPath = `/books/${bookId}/lessons/${lesson.id}`;

          return (
            <div
              key={lesson.id}
              className={`card ${canOpenLesson ? "card-hover" : "card-disabled"}`}
            >
              <div className="lesson-row">
                <div className="lesson-badge">{lesson.number}</div>

                <div className="lesson-main">
                  <p className="arabic-text">{lesson.titleAr}</p>
                  <h3 className="lesson-title">{lesson.titleEn}</h3>
                </div>

                {canOpenLesson ? (
                  isPreview ? (
                    <button className="btn" onClick={handleLockedLessonClick}>
                      Sign up to open
                    </button>
                  ) : (
                    <Link to={lessonPath}>
                      <button className="btn">Start Lesson</button>
                    </Link>
                  )
                ) : (
                  <button className="btn" disabled>
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
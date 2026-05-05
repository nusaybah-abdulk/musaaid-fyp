import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchLessonById } from "../lib/lessons";
import Flashcard from "../components/Flashcard";
import BackButton from "../components/BackButton";
import Preview from "../components/Preview";

export default function LessonView() {
  const { bookId, lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  //flipping all flashcard together
  const [allFlipped, setAllFlipped] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      setLoading(true);
      const lessonData = await fetchLessonById(lessonId);
      setLesson(lessonData);
      setLoading(false);
    }

    loadLesson();
  }, [lessonId]); //will be done whenever lesson ID changes

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || lesson.bookId !== bookId) {
    return (
      <div className="page">
        <p className="muted">Lesson not found.</p>
      </div>
    );
  }

  return (
    <Preview 
     >
    <div className="page page--lesson">
      <BackButton to={`/books/${bookId}/lessons`} label="Back to Lessons" />

      <header className="page-header lesson-header">
        <p className="lesson-number-label">Lesson {lesson.number}</p>
        <h1 className="arabic-text lesson-title-ar">{lesson.titleAr}</h1>
        <p className="lesson-title-en">{lesson.titleEn}</p>
      </header>

      <section className="card lesson-section">
        <div className="card-row">
          <div>
            <h2 className="card-title">Lesson Quiz</h2>
            <p className="muted card-subtitle">
              Revise this lesson with a focused quiz.
            </p>
          </div>

          <Link to={`/books/${bookId}/lessons/${lessonId}/quiz`}>
            <button className="btn btn-primary" type="button">
              Start Lesson Quiz
            </button>
          </Link>
        </div>
      </section>

      {lesson.summary && (
        <section className="card lesson-section">
          <h2 className="card-title">Lesson Summary</h2>
          <p>{lesson.summary}</p>
        </section>
      )}

      {lesson.outcomes?.length > 0 && (
        <section className="card lesson-section">
          <h2 className="card-title">Learning Outcomes</h2>
          <div className="lesson-list-block">
            {lesson.outcomes.map((outcome, index) => (
              <p key={index} className="lesson-list-item">
                {index + 1}. {outcome}
              </p>
            ))}
          </div>
        </section>
      )}

      {lesson.grammar?.length > 0 && (
        <section className="card lesson-section">
          <h2 className="card-title">Grammar Summary</h2>
          <div className="lesson-stack">
            {lesson.grammar.map((point, index) => (
              <div key={index} className="lesson-block">
                <h3 className="lesson-block-title">{point.title}</h3>
                <p>{point.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lesson.examples?.length > 0 && (
        <section className="card lesson-section">
          <h2 className="card-title">Examples</h2>
          <div className="lesson-stack">
            {lesson.examples.map((example, index) => (
              <div key={index} className="lesson-example">
                <p className="arabic-text lesson-example-ar">{example.arabic}</p>
                <p className="muted lesson-example-en">{example.english}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lesson.vocab?.length > 0 && (
        <section className="card lesson-section">
          <h2 className="card-title">Vocabulary</h2>
          <p className="muted card-subtitle">Click a card to flip it.</p>

          <div>
            <button
              className="btn"
              onClick={() => setAllFlipped((prev) => !prev)}
              type="button"
            >
              {allFlipped ? "Hide All" : "Flip All"}
            </button>

          </div>

          <div className="lesson-vocab-grid">
            {lesson.vocab.map((word, index) => (
              <Flashcard
                key={index}
                front={word.ar}
                back={word.en}
                flipped={allFlipped}
                frontClassName="arabic-text lesson-vocab-ar"
                backClassName="lesson-vocab-en"
              />
            ))}
          </div>
        </section>
      )}

      {!lesson.summary &&
        !lesson.outcomes?.length &&
        !lesson.grammar?.length &&
        !lesson.examples?.length &&
        !lesson.vocab?.length && (
          <section className="card lesson-section">
            <h2 className="card-title">Lesson Content</h2>
            <p className="muted">Full lesson notes coming soon.</p>
          </section>
        )}

      
    </div>
    </Preview>
  );
}
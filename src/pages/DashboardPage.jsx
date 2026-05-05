/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { seedBook1LessonMetadata } from "../lib/seedLesson";
// import { uploadBook1Questions } from "../lib/uploadQuestions";
import { fetchBooks } from "../lib/books";
import { fetchQuizAttemptsByUser } from "../lib/quizAttempts";
import {
  getStatsFromAttempts,
  getMasteryFromAttempts,
  getProgressByBook,
} from "../lib/dashboardHelpers";
import Preview from "../components/Preview";
import { useAuthUser } from "../lib/auth";

// set to true when uploading lessons and UNCOMMENT IMPORTS!
const SHOW_DEV_TOOLS = false;

const quote = {
  ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
  en: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.",
  source: "Sahih Muslim",
};

export default function DashboardPage() {
  const [showTranslation, setShowTranslation] = useState(false);
  //flip topics to score for mastery
  const [flip, setFlip] = useState({});
  const user = useAuthUser();

  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);



  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await fetchBooks();
        setBooks(data || []); //if left side is falsy (null or undefined for some reason)
      } catch (error) {
        console.error("Failed to fetch books:", error);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    }

    loadBooks();
  }, []);

  useEffect(() => {
    async function loadAttempts() {
      if (user === undefined) {
        return; /*want to waint until its clear if the user is signed in or not, loadattempts will run again once the user state us updated*/
      }
      
      if (!user?.uid) {
        setAttempts([]); //clear attempts just in case user was logged in thne signed out
        setLoadingAttempts(false);
        return;
      }

      setLoadingAttempts(true);

      try {
        const data = await fetchQuizAttemptsByUser(user.uid);
        setAttempts(data || []);
      } catch (error) {
        console.error("Failed to fetch quiz attempts:", error);
        setAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    }

    loadAttempts();
  }, [user]);

  // four block summary stats
  const stats = getStatsFromAttempts(attempts);
  // topic mastery block
  const mastery = getMasteryFromAttempts(attempts);
  const progressByBook = getProgressByBook(books, attempts);

  function toggleTopic(key) {
    setFlip((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  let progressContent;

  //book progress bars
  if (loadingBooks) {
    progressContent = <p className="muted">Loading books...</p>;
  } else if (books.length === 0) {
    progressContent = <p className="muted">No books found yet.</p>;
  } else {
    progressContent = (
      <div className="dash-progress">
        {books.map((book) => {
          const progress = progressByBook[book.id] || { 
            //prevent fails if no progress exists
            completed: 0,
            total: 0, 
            pct: 0,
            status: "Not started",
          };

          return (
            <div key={book.id} className="card progress-card card-hover">
              <h3 className="progress-title">
                {book.number ? `Book ${book.number}` : book.title || "Book"}
              </h3>

              <p className="muted">
                {progress.completed} / {progress.total} lessons
              </p>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>

              <p className="muted progress-status">Status: {progress.status}</p>

              <Link
                to={`/books/${book.id}/lessons`}
                className="btn btn-primary"
              >
                Continue
              </Link>
            </div>
          );
        })}
      </div>
    );
  }

  const hasMasteryData =
    mastery.strong.length > 0 ||
    mastery.medium.length > 0 ||
    mastery.weak.length > 0;

  return (
    <Preview>
    <div className="page dash">
  
      <header className="dashboard-hero">
        <p className="dashboard-eyebrow">Dashboard</p>
        <h1 className="dashboard-welcome">   Welcome back, {user?.displayName || "User"}</h1>
        <p className="dashboard-subtext">
          Continue your Arabic revision and track your progress.
        </p>
{/*         
        {SHOW_DEV_TOOLS && (
          <div className="dash-dev-actions">
            <button
              className="btn"
              type="button"
              onClick={seedBook1LessonMetadata}
            >
              Upload Book 1 Lessons content
            </button>

            <button
              className="btn"
              type="button"
              onClick={uploadBook1Questions}
            >
              Upload Book 1 Questions
            </button>
          </div>
        )} */}

      </header>

      <section className="dash-section">
        <h2 className="dash-heading">Analytics Overview</h2>

        {loadingAttempts ? (
          <p className="muted">Loading analytics...</p>
        ) : (
          <div className="dash-metrics">
            <div className="card metric card-hover">
              <div className="metric-value">{stats.lessonsCompleted}</div>
              <div className="metric-label muted">Lessons Completed</div>
            </div>

            <div className="card metric card-hover">
              <div className="metric-value">{stats.avgScore}%</div>
              <div className="metric-label muted">Average Score</div>
            </div>

            <div className="card metric card-hover">
              <div className="metric-value">{stats.testsTaken}</div>
              <div className="metric-label muted">Tests Taken</div>
            </div>

            <div className="card metric card-hover">
              <div className="metric-value">{stats.bestScore}%</div>
              <div className="metric-label muted">Best Score</div>
            </div>
          </div>
        )}
      </section>

      <section className="card dash-quote card-hover">
        <div className="dash-row">
          <h3 className="dash-subheading">Quote </h3>

          <button
            className="btn"
            type="button"
            onClick={() => setShowTranslation((prev) => !prev)}
          >
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </button>
        </div>

        <div className="quote-panel">
          <p className="arabic-text quote-ar">{quote.ar}</p>
        </div>

        {showTranslation && <p className="muted quote-en">{quote.en}</p>}

        <p className="muted quote-source">
          <strong>Source:</strong> {quote.source}
        </p>
      </section>


    <section className="card dash-mastery">
      <h3 className="dash-subheading">Topic Mastery Summary</h3>

      {!hasMasteryData ? (
        <p className="muted">
          Complete your first quiz to unlock topic mastery insights.
        </p>
      ) : (
        <div className="mastery-stack">
          <p className="muted">Click to view strength</p>
          <MasteryBlock
            title="Confident"
            count={mastery.strong.length}
            dotClass="dot-strong"
            blockClass="mastery-strong"
            topics={mastery.strong}
            flip={flip}
            onToggle={toggleTopic}
          />

          <MasteryBlock
            title="Improving"
            count={mastery.medium.length}
            dotClass="dot-mid"
            blockClass="mastery-mid"
            topics={mastery.medium}
            flip={flip}
            onToggle={toggleTopic}
          />

          <MasteryBlock
            title="Needs Attention"
            count={mastery.weak.length}
            dotClass="dot-weak"
            blockClass="mastery-weak"
            topics={mastery.weak}
            flip={flip}
            onToggle={toggleTopic}
          />
        </div>
      )}
    </section>

      <section className="dash-section">
        <h2 className="dash-heading">Progress Overview</h2>
        {progressContent}
      </section>
    </div>
    </Preview>
  );
}
function MasteryBlock({
  title,
  count,
  dotClass,
  blockClass,
  topics,
  flip,
  onToggle,
}) {
  return (
    
    <div className={`mastery-block ${blockClass} card-hover`}>
      <div className="mastery-head">
        <div className="mastery-title">
          <span className={`dot ${dotClass}`} />
          <strong>{title}</strong>
        </div>
        <span className="muted">{count} topics</span>
      </div>

      <div className="tag-row">
        {topics.map((topic) => (
          <button
            key={topic.key}
            type="button"
            className="topic-tag"
            onClick={() => onToggle(topic.key)}
          >
            {flip[topic.key]
              ? `${topic.correct}/${topic.total} (${topic.pct}%)`
              : topic.en}
          </button>
        ))}
      </div>
    </div>
   
  );
}
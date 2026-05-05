
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { saveQuizAttempt } from "../lib/quizAttempts";
import QuizResults from "./QuizResults";
import {
  checkAnswer,
  getCorrectAnswerText,
  getScore,
  getWrongQuestionIds,
  getTopicBreakdownForSave,
  getAnsweredCount,
  getProgressPct,
  getNavQuestionState,
  getAdaptiveLevelLabel,
  getNextAdaptiveLevel,
  pickAdaptiveQuestion,
} from "../lib/quizHelpers";

// displays current question
function QuizQuestion({ question, userAnswer, onAnswer }) {
  if (!question) return null;

  if (question.type === "mcq") {
    return (
      <>
        <h2 className="quiz-question">{question.question}</h2>

        <div className="quiz-options">
          {question.options.map((option, optionIndex) => {
            const selected = Number(userAnswer) === optionIndex;
            // make ID for each option
            const inputId = `${question.id}-${optionIndex}`;

            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`quiz-option ${
                  selected ? "quiz-option--selected" : ""
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`q-${question.id}`}
                  value={optionIndex}
                  checked={selected}
                  onChange={() => onAnswer(optionIndex)}
                />
                <span className="quiz-option-text">{option}</span>
              </label>
            );
          })}
        </div>
      </>
    );
  }

  if (question.type === "true-false") {
    return (
      <>
        <h2 className="quiz-question">{question.question}</h2>

        <div className="quiz-options">
          {["true", "false"].map((option) => {
            const selected = String(userAnswer) === option;
            const inputId = `${question.id}-${option}`;

            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`quiz-option ${
                  selected ? "quiz-option--selected" : ""
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`q-${question.id}`}
                  value={option}
                  checked={selected}
                  onChange={() => onAnswer(option)}
                />
                <span className="quiz-option-text">
                  {option === "true" ? "True" : "False"}
                </span>
              </label>
            );
          })}
        </div>
      </>
    );
  }

  if (question.type === "short-answer") {
    return (
      <>
        <h2 className="quiz-question">{question.question}</h2>

        <input
          className="quiz-input"
          type="text"
          value={userAnswer}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer..."
        />
      </>
    );
  }

  if (question.type === "fill-blank-options") {
    return (
      <>
        <div className="quiz-fill-blank">
          <p className="quiz-question">{question.question}</p>
          {question.hint && <p className="muted">{question.hint}</p>}
        </div>

        <div className="quiz-options">
          {question.options.map((option, optionIndex) => {
            const selected = Number(userAnswer) === optionIndex;
            const inputId = `${question.id}-${optionIndex}`;

            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`quiz-option ${
                  selected ? "quiz-option--selected" : ""
                }`}
              >
                <input
                  id={inputId}
                  type="radio"
                  name={`q-${question.id}`}
                  value={optionIndex}
                  checked={selected}
                  onChange={() => onAnswer(optionIndex)}
                />
                <span className="quiz-option-text arabic-text">{option}</span>
              </label>
            );
          })}
        </div>
      </>
    );
  }

  return <p className="muted">Unsupported question type</p>;
}

export default function QuizEngine({
  title = "Quiz",
  subtitle = "",
  questions = [],
  backTo = "/",
  bookId = null,
  lessonId = null,
  mode = "standard",
  questionCount = 10,
}) {
  const navigate = useNavigate();
  // current question number 0 means q1
  const [index, setIndex] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
    // determines if results page should be shown
  const [isComplete, setIsComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
 // only used for adaptive mode
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(2);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [levelMessage, setLevelMessage] = useState("");

   // adaptive quiz initialises when question data becomes available or when the quiz mode changes
  useEffect(() => {
    if (mode !== "adaptive") return;
    if (!questions.length) return;

    const firstQuestion = pickAdaptiveQuestion(questions, [], 2);

    if (firstQuestion) {
      setActiveQuestions([firstQuestion]);
      setIndex(0);
      setAnswers({});
      setShowFeedback(false);
      setIsComplete(false);
      setCurrentLevel(2);
      setCorrectStreak(0);
      setWrongStreak(0);
      setLevelMessage("");
    }
  }, [mode, questions]);
  // displayed is either all qs for normal mode or just the active q for adpative
  const displayedQuestions = mode === "adaptive" ? activeQuestions : questions;
  // how many question currently have
  const total = displayedQuestions.length;
  // how many qs is quiz meant to have
  const targetCount = Number(questionCount) || total;
  
  const currentQuestion = displayedQuestions[index];
  // to allow unanswered qs
  const userAnswer = answers[index] ?? "";
  const answeredCount = getAnsweredCount(answers);
  const score = getScore(displayedQuestions, answers);
  const isCorrect = checkAnswer(currentQuestion, userAnswer);
  const progressPct = getProgressPct(answeredCount, questionCount);

 // decided when finish buttons appears (on last q and lastq is when apdt has done enough qs)
  const canFinish =
    mode === "adaptive"
      ? displayedQuestions.length >= questionCount && //hasEnoughQuestions
        index === displayedQuestions.length - 1 //isLastQuestion
      : index === displayedQuestions.length - 1;

// navbar jumping
  function handleJumpToQuestion(targetIndex) {
    setIndex(targetIndex);
    setShowFeedback(false);
  }

  // answers array being built up
  function handleAnswer(value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
    setShowFeedback(false);
  }

  function handleNext() {
    if (mode !== "adaptive") {
      if (index < total - 1) {
        setIndex((prev) => prev + 1);
        setShowFeedback(false);
      }
      return;
    }

    const wasCorrect = checkAnswer(currentQuestion, userAnswer);

    let nextCorrectStreak = correctStreak;
    let nextWrongStreak = wrongStreak;
    let nextLevel = currentLevel;
   

    // changes difficulty, resets counter after level change
    if (wasCorrect) {
      nextCorrectStreak += 1;
      nextWrongStreak = 0;

      if (nextCorrectStreak >= 2) {
        nextLevel = getNextAdaptiveLevel(currentLevel, "up");

    
        nextCorrectStreak = 0;
      }
    } else {
      nextWrongStreak += 1;
      nextCorrectStreak = 0;

      if (nextWrongStreak >= 2) {
        nextLevel = getNextAdaptiveLevel(currentLevel, "down");
        nextWrongStreak = 0;
      }
    }

    setCurrentLevel(nextLevel);
    setCorrectStreak(nextCorrectStreak);
    setWrongStreak(nextWrongStreak);
   
    // take all active qs and extract ID so it isnt reused
    const usedIds = activeQuestions.map((question) => question.id);
    const isLastShownQuestion = index === activeQuestions.length - 1;
    const canAddMoreQuestions = activeQuestions.length < questionCount;

    if (isLastShownQuestion && canAddMoreQuestions) {
      const nextQuestion = pickAdaptiveQuestion(questions, usedIds, nextLevel);

      if (nextQuestion) {
        setActiveQuestions((prev) => [...prev, nextQuestion]);
        setIndex((prev) => prev + 1);
      }
    } else if (index < activeQuestions.length - 1) {
      setIndex((prev) => prev + 1);
    }

    setShowFeedback(false);
  }

  function handlePrevious() {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      setShowFeedback(false);
    }
  }

  async function handleFinish() {
    const currentUser = auth.currentUser;

    // just in case if ur going to allow non logged in users to do quizx
    if (!currentUser) {
      setIsComplete(true);
      return;
    }

    setIsSaving(true);
// quiz attempte record being made
    try {
      await saveQuizAttempt({
        userId: currentUser.uid,
        quizTitle: title,
        bookId,
        lessonId,
        scorePct: score.pct,
        correctCount: score.correct,
        totalQuestions: displayedQuestions.length,
        wrongQuestionIds: getWrongQuestionIds(displayedQuestions, answers),
        topicBreakdown: getTopicBreakdownForSave(displayedQuestions, answers),
      });
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
    } finally {
      setIsSaving(false);
      setIsComplete(true);
    }
  }

  // reset quiz state to allow for retake and selects new q
  function handleRetake() {
    setIndex(0);
    setAnswers({});
    setShowFeedback(false);
    setIsComplete(false);

    if (mode === "adaptive" && questions.length) {
      const firstQuestion = pickAdaptiveQuestion(questions, [], 2);

      if (firstQuestion) {
        setActiveQuestions([firstQuestion]);
        setCurrentLevel(2);
        setCorrectStreak(0);
        setWrongStreak(0);
        setLevelMessage("");
      }
    }
  }

  // handle empty quizzes 0 become truthy
  if (!questions.length) {
    return (
      <div className="page">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        <p className="muted">No questions found for this quiz yet.</p>

        <button className="btn" type="button" onClick={() => navigate(backTo)}>
          Back
        </button>
      </div>
    );
  }

  if (mode === "adaptive" && !displayedQuestions.length) {
    return (
      <div className="page">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        <p className="muted">Loading adaptive quiz...</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <QuizResults
        questions={displayedQuestions}
        answers={answers}
        score={score}
        backTo={backTo}
        checkAnswer={checkAnswer}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="page">
      
      <header className="page-header">

      <div className="quiz-title-row">
        <h1 className="page-title">{title}</h1>
        {/* diifcult label only for apative mode  */}
        {mode === "adaptive" && (
          <div
            className={`quiz-level quiz-level--${getAdaptiveLevelLabel(
              currentLevel
            ).toLowerCase()}`}
          >
            Difficulty: {getAdaptiveLevelLabel(currentLevel)}
          </div>
        )}
      </div>

      <p className="quiz-meta-item">
        Question {index + 1} of {targetCount}
      </p>

      {mode === "adaptive" && levelMessage && (
        <div className="quiz-level-banner">{levelMessage}</div>
      )}

      <div className="quiz-progress">
        <div
          className="quiz-progress-fill"
          style={{ "--pct": `${progressPct}%` }}
        />
      </div>

      </header>

      {mode !== "adaptive" && (
        <nav className="quiz-nav" aria-label="Question navigation">
          {displayedQuestions.map((question, questionIndex) => {
            // gets state unaswered, current etc for numbered display
            const state = getNavQuestionState(questionIndex, index, answers);

            return (
              <button
                key={question.id}
                type="button"
                className={`quiz-nav-btn quiz-nav-btn--${state}`}
                onClick={() => handleJumpToQuestion(questionIndex)}
              >
                {questionIndex + 1}
              </button>
            );
          })}
        </nav>
      )}

      <section className="card quiz-card">
        <QuizQuestion
          question={currentQuestion}
          userAnswer={userAnswer}
          onAnswer={handleAnswer}
        />

        <div className="quiz-actions">
          <button
            className="btn btn-primary"
            type="button"
            disabled={userAnswer === ""}
            onClick={() => setShowFeedback(true)}
          >
            Check Answer
          </button>
        </div>

        {showFeedback && (
          <div
            className={`quiz-feedback ${
              isCorrect ? "quiz-feedback--ok" : "quiz-feedback--bad"
            }`}
          >
            <h3>{isCorrect ? "Correct" : "Incorrect"}</h3>

            {!isCorrect && (
              <p className="muted">
                <strong>Correct answer:</strong>{" "}
                {getCorrectAnswerText(currentQuestion)}
              </p>
            )}

            {currentQuestion.explanation && (
              <p className="muted">{currentQuestion.explanation}</p>
            )}
          </div>
        )}
      </section>

      <div className="quiz-actions">
        <button
          className="btn"
          type="button"
          onClick={handlePrevious}
          disabled={index === 0 || isSaving}
        >
          Previous
        </button>

        {!canFinish ? (
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleNext}
            disabled={isSaving}
          >
            Next
          </button>
        ) : (
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleFinish}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}


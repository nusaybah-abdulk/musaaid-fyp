/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getQuestionStatus,
  getUserAnswerText,
  getCorrectAnswerText,
  getTopicBreakdown,
  formatTopicName,
  getRecommendation,
} from "../lib/quizHelpers";

function getAssessmentLabel(scorePct) {
  if (scorePct < 50) return "Review recommended";
  if (scorePct < 75) return "Needs revision";
  return "Strong grasp";
}


export default function QuizResults({
  questions,
  answers,
  score,
  backTo,
  checkAnswer,
  onRetake,
}) {
  const navigate = useNavigate();
  // which q summary is currently expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  const label = getAssessmentLabel(score.pct);
  const topicBreakdown = getTopicBreakdown(questions, answers);
// remembert topic breakdown is orderded  weakest to strongest
  const weakestTopic = topicBreakdown[0] || null;
  const strongestTopic =
    topicBreakdown.length > 1
      ? topicBreakdown[topicBreakdown.length - 1]
      : null;

  const recommendation = getRecommendation(weakestTopic, score.pct);

  const correctCount = score.correct;
  const wrongCount = questions.filter((question, index) => {
    const answer = answers[index];
    return (
      answer !== undefined &&
      answer !== "" && // removes unanswered qs
      !checkAnswer(question, answer) // asking is this answer wrong
    );
  }).length; //gives number of wrong aswers

  const unansweredCount = questions.length - correctCount - wrongCount;

  function toggleExpanded(index) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Results</h1>

        <p className="results-score">
          {score.correct} / {questions.length} correct ({score.pct}%)
        </p>

        <p className="results-assessment">
          Assessment: <strong>{label}</strong>
        </p>
      </header>

      <section className="card">
        <h2 className="card-title">Performance Summary</h2>

        <div className="results-stats">
          <p>Correct: {correctCount}</p>
          <p>Incorrect: {wrongCount}</p>
          <p>Unanswered: {unansweredCount}</p>
        </div>

        <div className="results-topic-summary">
          {strongestTopic && (
            <div className="results-topic-row">
              <span className="results-topic-label">Best Topic</span>
              <span>
                {formatTopicName(strongestTopic.topic)} — {strongestTopic.correct}/
                {strongestTopic.total} correct ({strongestTopic.pct}%)
              </span>
            </div>
          )}

          {weakestTopic && (
            <div className="results-topic-row">
              <span className="results-topic-label">Needs Revision</span>
              <span>
                {formatTopicName(weakestTopic.topic)} — {weakestTopic.correct}/
                {weakestTopic.total} correct ({weakestTopic.pct}%)
              </span>
            </div>
          )}
        </div>

        <p className="results-recommendation">{recommendation}</p>
      </section>

      <section className="card">
        <h2 className="card-title">Question Summary</h2>

        <div className="quiz-summary">
          {/* loop through all qs and create review row */}
          {questions.map((question, index) => {
            const answer = answers[index];
            const status = getQuestionStatus(question, answer);
            const isExpanded = expandedIndex === index;

            return (
              // styles based on statuts
              <div
                key={question.id}
                className={`quiz-summary-item quiz-summary-item--${status}`}
              >
                <button
                  type="button"
                  className="quiz-summary-row"
                  onClick={() => toggleExpanded(index)}
                >
                  <span
                    className={`quiz-summary-dot quiz-summary-dot--${status}`}
                  />
                  <span className="quiz-summary-main">
                    <span className="quiz-summary-question">
                      Q{index + 1}: {question.question}
                    </span>
                    <span className="quiz-summary-status">
                      {status === "correct" && "Correct"}
                      {status === "wrong" && "Incorrect"}
                      {status === "empty" && "Not answered"}
                    </span>
                  </span>
                </button>

                {isExpanded && (
                  <div className="quiz-summary-details">
                    <p>
                      <strong>Topic:</strong>{" "}
                      {formatTopicName(question.topic || "other")}
                    </p>

                    <p>
                      <strong>Your answer:</strong>{" "}
                      {getUserAnswerText(question, answer)}
                    </p>

                    {(status === "wrong" || status === "empty") && (
                      <p>
                        <strong>Correct answer:</strong>{" "}
                        {getCorrectAnswerText(question)}
                      </p>
                    )}

                    {question.explanation && (
                      <p className="quiz-summary-explanation">
                        <strong>Why:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="quiz-actions">
        <button className="btn" type="button" onClick={() => navigate(backTo)}>
          Back to Lessons
        </button>

        <button className="btn btn-primary" type="button" onClick={onRetake}>
          Retake
        </button>
      </div>
    </div>
  );
}
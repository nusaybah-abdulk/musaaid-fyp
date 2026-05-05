
import { useState } from "react";
import { analyseArabicSentence } from "../lib/sentenceChecker";
import Preview from "../components/Preview";

export default function SentenceCheckerPage() {
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!sentence.trim()) {
      setError("Please enter a sentence.");
      return;
    }

    try {
      setLoading(true);
      const data = await analyseArabicSentence(sentence);
      setResult(data);
    } catch (err) {
      console.error("Sentence checker error:", err);
      setError(err?.message || "Unable to analyse the sentence right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Preview
 
  >
    <div className="page checker-page">
      <header className="page-header checker-header">
        <h1 className="page-title">Arabic Sentence Checker</h1>
  
      </header>

      <section className="card checker-input-card">
        <div className="checker-card-head">
          <h2 className="section-title">Practice your writing</h2>
          <p className="muted">
          Write a sentence in Arabic and receive instant feedback, corrections, and explanations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="checker-form">
          <label className="form-label" htmlFor="sentence-input">
      
          </label>

          <textarea
            id="sentence-input"
            className="checker-textarea"
            rows="3"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="اكتب جملة هنا"
            dir="rtl"
          />

          <div className="checker-actions">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Checking..." : "Check sentence"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <section className="card checker-message-card">
          <p className="form-message form-message-error">{error}</p>
        </section>
      )}

      {result && (
        <section className="card checker-result-card">
          <div className="checker-result-header">
            <div>
              <h2 className="section-title">Feedback</h2>
              
            </div>

            <span
              className={`checker-status ${
                result.isCorrect ? "checker-status-correct" : "checker-status-incorrect"
              }`}
            >
              {result.isCorrect ? "Correct" : "Needs correction"}
            </span>
          </div>

          <div className="checker-result-grid">
            <div className="checker-result-block">
              <h3 className="checker-block-title">Corrected sentence</h3>
              <p className="arabic-text checker-arabic-box">
                {result.correctedSentence}
              </p>
            </div>

            <div className="checker-result-block">
              <h3 className="checker-block-title">Explanation</h3>
              <p className="checker-body-text">{result.englishExplanation}</p>
            </div>

            <div className="checker-result-block">
              <h3 className="checker-block-title">Topics to revise</h3>
              <p className="checker-body-text">
                {result.revisionTopics || "No specific topic provided."}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
    </Preview>
  );
}
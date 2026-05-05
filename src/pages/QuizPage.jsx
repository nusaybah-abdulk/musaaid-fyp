import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import QuizEngine from "../components/QuizEngine";
import BackButton from "../components/BackButton";
import { fetchLessonById, fetchLessonsByBook } from "../lib/lessons";
import { fetchQuizAttemptsByUser } from "../lib/quizAttempts";
import {
  fetchQuestionsByLessonId,
  fetchQuestionsByLessonIds,
} from "../lib/questions";
import Preview from "../components/Preview";
import { useAuthUser } from "../lib/auth";

/*  reads URL, decides what type of quiz is requested
fetches the correct question set then passes it onto quiz enginer
to run the actual quiz AKA quiz setup page
*/

export default function QuizPage() {
  const { bookId, lessonId } = useParams();
  // to read extra url bits e.g mode, range, count
  const [searchParams] = useSearchParams();

  const [lesson, setLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthUser();

  const from = Number(searchParams.get("from"));
  const to = Number(searchParams.get("to"));
  const mode = searchParams.get("mode") || "adaptive";
  const questionCount = Number(searchParams.get("count")) || 10;

  const isLessonQuiz = Boolean(lessonId);

  useEffect(() => {
    async function loadQuizData() {
      if (mode === "wrong" && user === undefined) {
        return;
      }

      setLoading(true);

      if (isLessonQuiz) {
        const lessonData = await fetchLessonById(lessonId);
        setLesson(lessonData);

        const questionData = await fetchQuestionsByLessonId(lessonId);
        setQuizQuestions(questionData);
        setLoading(false);
        return;
      }

      setLesson(null);

      const bookLessons = await fetchLessonsByBook(bookId);

      const sortedLessons = bookLessons
        .slice()
        .sort((a, b) => a.number - b.number);


      if (mode === "wrong")  {
        const lessonIds = sortedLessons.map((l) => l.id);
        const questionData = await fetchQuestionsByLessonIds(lessonIds);

        if (!user) {
          setLoading(false);
          return;
        }

        const attempts = await fetchQuizAttemptsByUser(user.uid);

        // takes wrong ids from all emptys, flattens to array and removes duplicates
        const wrongIds = [
          ...new Set(
            attempts.flatMap((attempt) => attempt.wrongQuestionIds || [])
          ),
        ];

        //gets all wrong questions
        const wrongQuestions = questionData.filter((question) =>
          wrongIds.includes(question.id)
        );
        
        // limits wrong question to desired count
        setQuizQuestions(wrongQuestions.slice(0, questionCount));
      }
      else {
        const filteredLessons =
          Number.isFinite(from) && Number.isFinite(to)
            ? sortedLessons.filter(
                (lessonItem) =>
                  lessonItem.number >= from && lessonItem.number <= to
              )
            : sortedLessons;

        const lessonIds = filteredLessons.map((lessonItem) => lessonItem.id);
        const questionData = await fetchQuestionsByLessonIds(lessonIds);

        setQuizQuestions(questionData);
      }
      setLoading(false);
    }

    loadQuizData();
  }, [
    bookId,
    lessonId,
    from,
    to,
    mode,
    questionCount,
    isLessonQuiz,
    user, 
  ]); // quiz data reloads if any of these changes

 // making quiz titile
  const rangeText =
      Number.isFinite(from) && Number.isFinite(to)
        ? `Lessons ${from} – ${to}`
        : "Whole book";

  let title;

  if (isLessonQuiz) {
    title = lesson ? `Lesson ${lesson.number} Quiz` : "Lesson Quiz";
  } else if (mode === "wrong") {
    title = "Wrong Answers Quiz";
  } else {
    title = rangeText;
  }

  const subtitle = isLessonQuiz && lesson ? lesson.titleEn : "";

  const backTo = isLessonQuiz
    ? `/books/${bookId}/lessons/${lessonId}`
    : `/books/${bookId}/lessons`;

  if (loading) {
    return (
      <div className="page">
        <BackButton to={backTo} label="Back to Lessons" />
        <p className="muted">Loading quiz...</p>
      </div>
    );
  }

  return (
    <Preview
    title="Sign up to start quizzes"
    message="Create an account to attempt quizzes, receive feedback, and track your results."
  >
    <>
      <div className="page">
        <BackButton to={backTo} label="Back to Lessons" />
      </div>

      <QuizEngine
        title={title}
        subtitle={subtitle}
        questions={quizQuestions}
        backTo={backTo}
        bookId={bookId}
        lessonId={lessonId || null}
        mode={isLessonQuiz ? "standard" : mode}
        questionCount={questionCount}
      />
    </>
    </Preview>
  );
}


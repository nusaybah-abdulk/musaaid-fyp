function normalise(text) {
    return String(text ?? "").trim().toLowerCase();
  }
  
  export function checkAnswer(question, userAnswer) {
    if (!question) return false;
  
    if (question.type === "mcq") {
      return Number(userAnswer) === Number(question.answer);
    }
  
    if (question.type === "true-false") {
      if (userAnswer === "") return false;
      return String(userAnswer) === String(question.answer);
    }
  
    if (question.type === "fill-blank-options") {
      return Number(userAnswer) === Number(question.answer);
    }
  
    if (question.type === "short-answer") {
      const accepted = question.acceptableAnswers?.length
        ? question.acceptableAnswers
        : [question.answer];
  
      return accepted.some(
        (answer) => normalise(answer) === normalise(userAnswer)
      );
    }
  
    return false;
  }
  
  export function getCorrectAnswerText(question) {
    if (!question) return "";
  
    if (question.type === "mcq" || question.type === "fill-blank-options") {
      return question.options?.[question.answer] ?? ""; //from the  answer option return the text thats at the index of the correct answer
    }
  
    if (question.type === "true-false") {
      return String(question.answer) === "true" || question.answer === true
        ? "True"
        : "False";
    }
  
    if (question.type === "short-answer") {
      return question.answer;
    }
  
    return "";
  }
  
  export function getUserAnswerText(question, userAnswer) {
    if (userAnswer === undefined || userAnswer === "") {
      return "No answer";
    }
  
    if (question.type === "mcq" || question.type === "fill-blank-options") {
      return question.options?.[userAnswer] ?? "Unknown answer";
    }
  
    if (question.type === "true-false") {
      return String(userAnswer) === "true" ? "True" : "False";
    }
  
    if (question.type === "short-answer") {
      return userAnswer;
    }
  
    return String(userAnswer);
  }
  
  export function getScore(questions, answers) {
    if (!questions.length) return { correct: 0, pct: 0 };
  
    let correct = 0;
    
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      const answer = answers[i];
  
      if (answer === undefined || answer === "") continue;
      if (checkAnswer(question, answer)) correct += 1;
    }
  
    return {
      correct,
      pct: Math.round((correct / questions.length) * 100),
    };
  }
  
  export function getWrongQuestionIds(questions, answers) {
    const wrongIds = [];
  
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      const answer = answers[i];
  
      if (answer === undefined || answer === "") continue;
  
      if (!checkAnswer(question, answer)) {
        wrongIds.push(question.id);
      }
    }
  
    return wrongIds;
  }
  
  export function getQuestionStatus(question, answer) {
    if (answer === undefined || answer === "") return "empty";
    return checkAnswer(question, answer) ? "correct" : "wrong";
  }
  
  export function getTopicBreakdown(questions, answers) {
    const topics = {};
  
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      const userAnswer = answers[i];
      const topic = question.topic || "other";
  
      // if this topic doesnt have an obj yet made
      if (!topics[topic]) {
        topics[topic] = {
          topic,
          correct: 0,
          total: 0,
        };
      }
    // if not just increase its counter
      topics[topic].total += 1;
  
      if (
        userAnswer !== undefined &&
        userAnswer !== "" &&
        checkAnswer(question, userAnswer)
      ) {
        topics[topic].correct += 1;
      }
    }
  
    // turn obj in array , calc % for each the orders from weakest to strongest
    return Object.values(topics)
      .map((item) => ({
        ...item,
        pct: Math.round((item.correct / item.total) * 100),
      }))
      .sort((a, b) => a.pct - b.pct);
  }
  
  //kept as a obj so it can be saved, pretty similar to above
  export function getTopicBreakdownForSave(questions, answers) {
    const topics = {};
  
    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      const answer = answers[i];
      const topic = question.topic || "other";
  
      if (!topics[topic]) {
        topics[topic] = {
          correct: 0,
          total: 0,
        };
      }
  
      topics[topic].total += 1;
  
      if (
        answer !== undefined &&
        answer !== "" &&
        checkAnswer(question, answer)
      ) {
        topics[topic].correct += 1;
      }
    }
  
    return topics;
  }

  // used for question navbar blocks colouring
  export function getNavQuestionState(index, currentIndex, answers) {
    // to highlight green if that index is the q we are looking at
    if (index === currentIndex) return "current";
  
    const answer = answers[index];
  
    if (answer === undefined || answer === "") {
      return "unanswered";
    }
  
    return "answered";
  }
  export function getAnsweredCount(answers = {}) {
    return Object.values(answers).filter(
      (answer) => answer !== undefined && answer !== ""
    ).length;
  }
  export function getProgressPct(answeredCount, total) {
    if (!total) return 0;
    return Math.round((answeredCount / total) * 100);
  }
  export function getAdaptiveLevelLabel(level) {
    if (level === 1) return "Easy";
    if (level === 2) return "Medium";
    return "Hard";
  }
  
  export function getNextAdaptiveLevel(currentLevel, direction) {
    if (direction === "up") {
      return Math.min(currentLevel + 1, 3);
    }
  
    if (direction === "down") {
      return Math.max(currentLevel - 1, 1);
    }
  
    return currentLevel;
  }
  
  export function pickAdaptiveQuestion(pool, usedIds, targetLevel) {
    // a question bank with used questions removed
    const unused = pool.filter((question) => !usedIds.includes(question.id));

    // selects questions with required difficulty only
    const exactMatches = unused.filter(
      (question) => Number(question.difficulty) === Number(targetLevel)
    );
  
    if (exactMatches.length > 0) {
      return exactMatches[0];
    }
  
    // if no exact allow nearby only ONE level away
    const nearbyMatches = unused.filter(
      (question) =>
        Math.abs(Number(question.difficulty ?? 2) - Number(targetLevel)) === 1
    );
  
    // worse comes to worse, any q is fine (not 1 away avaible)
    if (nearbyMatches.length > 0) {
      return nearbyMatches[0];
    }
  
    return unused[0] ?? null;
  }

  // remove dashes in topic names and captilese letters
  export function formatTopicName(topic) {
    return String(topic)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }


export function getRecommendation(weakestTopic, scorePct) {
  if (!weakestTopic) {
    return scorePct >= 75
      ? "Good work. Retake the quiz to reinforce what you know."
      : "Review the lesson and try again.";
  }

  if (scorePct >= 75) {
    return `Your weakest area was ${formatTopicName(
      weakestTopic.topic
    )}. Review it briefly, then retake the quiz to strengthen it.`;
  }

  return `Focus on revising ${formatTopicName(
    weakestTopic.topic
  )} before retaking this quiz.`;
}
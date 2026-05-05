import { describe, test, expect } from "vitest";

import {
  checkAnswer,
  getWrongQuestionIds,
  getScore,
  pickAdaptiveQuestion,
} from "../lib/quizHelpers.js";

import {
  getStatsFromAttempts,
  getMasteryFromAttempts,
} from "../lib/dashboardHelpers.js";

describe("checkAnswer", () => {
  test("returns true for a correct MCQ answer", () => {
    const mcq = { type: "mcq", answer: 1 };

    expect(checkAnswer(mcq, 1)).toBe(true);
  });

  test("returns false for an incorrect MCQ answer", () => {
    const mcq = { type: "mcq", answer: 1 };

    expect(checkAnswer(mcq, 0)).toBe(false);
  });

  test("accepts valid short-answer variations", () => {
    const short = {
      type: "short-answer",
      answer: "kitab",
      acceptableAnswers: ["kitab", "al-kitab"],
    };

    expect(checkAnswer(short, "kitab")).toBe(true);
    expect(checkAnswer(short, " al-kitab ")).toBe(true);
  });

  test("rejects incorrect short-answer responses", () => {
    const short = {
      type: "short-answer",
      answer: "kitab",
      acceptableAnswers: ["kitab", "al-kitab"],
    };

    expect(checkAnswer(short, "book")).toBe(false);
  });
});

describe("getScore", () => {
  test("calculates the correct score and percentage", () => {
    const questions = [
      { id: "q1", type: "mcq", answer: 1 },
      { id: "q2", type: "mcq", answer: 0 },
      { id: "q3", type: "short-answer", answer: "kitab" },
    ];

    const answers = {
      0: 1,
      1: 2,
      2: "kitab",
    };

    expect(getScore(questions, answers)).toEqual({
      correct: 2,
      pct: 67,
    });
  });
});

describe("getWrongQuestionIds", () => {
  test("returns the IDs of incorrectly answered questions", () => {
    const questions = [
      { id: "q1", type: "mcq", answer: 1 },
      { id: "q2", type: "mcq", answer: 0 },
      { id: "q3", type: "short-answer", answer: "kitab" },
    ];

    const answers = {
      0: 1,
      1: 2,
      2: "kitab",
    };

    expect(getWrongQuestionIds(questions, answers)).toEqual(["q2"]);
  });
});

describe("pickAdaptiveQuestion", () => {
  test("selects a question matching the target difficulty where available", () => {
    const pool = [
      { id: "q1", difficulty: 1 },
      { id: "q2", difficulty: 2 },
      { id: "q3", difficulty: 3 },
    ];

    const result = pickAdaptiveQuestion(pool, [], 2);

    expect(result.id).toBe("q2");
  });

  test("avoids previously used questions", () => {
    const pool = [
      { id: "q1", difficulty: 1 },
      { id: "q2", difficulty: 2 },
      { id: "q3", difficulty: 3 },
    ];

    const result = pickAdaptiveQuestion(pool, ["q2"], 2);

    expect(["q1", "q3"]).toContain(result.id);
  });

  test("selects the only remaining unused question", () => {
    const pool = [
      { id: "q1", difficulty: 1 },
      { id: "q2", difficulty: 2 },
      { id: "q3", difficulty: 3 },
    ];

    const result = pickAdaptiveQuestion(pool, ["q1", "q2"], 2);

    expect(result.id).toBe("q3");
  });
});

describe("getStatsFromAttempts", () => {
  test("aggregates dashboard statistics from quiz attempts", () => {
    const attempts = [
      { lessonId: "l1", scorePct: 60 },
      { lessonId: "l2", scorePct: 80 },
      { lessonId: "l1", scorePct: 90 },
    ];

    expect(getStatsFromAttempts(attempts)).toEqual({
      lessonsCompleted: 2,
      avgScore: 77,
      testsTaken: 3,
      bestScore: 90,
    });
  });
});

describe("getMasteryFromAttempts", () => {
    test("groups stronger and weaker topics based on performance", () => {
      const attempts = [
        {
          topicBreakdown: {
            demonstratives: { correct: 3, total: 4 },
            vocabulary: { correct: 1, total: 4 },
          },
        },
        {
          topicBreakdown: {
            demonstratives: { correct: 2, total: 2 },
            vocabulary: { correct: 2, total: 4 },
          },
        },
      ];
  
      const result = getMasteryFromAttempts(attempts);
  
      expect(result.strong.some((topic) => topic.key === "demonstratives")).toBe(true);
      expect(result.weak.some((topic) => topic.key === "vocabulary")).toBe(true);
    });
  });


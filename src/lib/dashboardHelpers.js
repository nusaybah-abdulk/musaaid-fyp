/* eslint-disable react/prop-types */

// summary stats for dash (attempt is scorePct: x)
export function getStatsFromAttempts(attempts=[]) {
    if (!attempts.length) {
      //default stats for new users
      return {
        lessonsCompleted: 0,
        avgScore: 0,
        testsTaken: 0,
        bestScore: 0,
      };
    }

   //reduce attempts array by sums (0 for undef)
    const totalScore = attempts.reduce(
      (sum, attempt) => sum + (attempt.scorePct || 0),
      0
    );

   // removing duplicates for lesson count
    const completedLessonIds = new Set(
      attempts
        .filter((attempt) => attempt.lessonId)
        .map((attempt) => attempt.lessonId)
    );
  
    return {
      lessonsCompleted: completedLessonIds.size,
      avgScore: Math.round(totalScore / attempts.length),
      testsTaken: attempts.length,
      bestScore: Math.max(...attempts.map((attempt) => attempt.scorePct || 0)),
    };
  }
  
  export function formatTopicName(topic) {
    return String(topic)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  //grouping by strentgh
  export function getMasteryFromAttempts(attempts =[]) {
    if (!attempts.length) {
      return {
        strong: [],
        medium: [],
        weak: [],
      };
    }
  
    const topicTotals = {};

    // getting topic data for each quiz attempt
    for (const attempt of attempts) {
      const topicBreakdown = attempt.topicBreakdown || {};

      // adds up total correct for each 
      for (const [topic, values] of Object.entries(topicBreakdown)) {
        //first time topic is seen start off with 0
        if (!topicTotals[topic]) {
          topicTotals[topic] = {
            correct: 0,
            total: 0,
          };
        }

        //if topic has been seen before increase the correct and totals
        topicTotals[topic].correct += values.correct || 0;
        topicTotals[topic].total += values.total || 0;
      }
    }
  
    const mastery = {
      strong: [],
      medium: [],
      weak: [],
    };
             
    //need obj to be array to loop (values is correct:x total: x) topic totals grouped above
    for (const [topic, values] of Object.entries(topicTotals)) {
      const pct = values.total
        ? Math.round((values.correct / values.total) * 100)
        : 0;
  
      const topicData = {
        key: topic,
        en: formatTopicName(topic),
        pct,
        correct: values.correct,
        total: values.total,
      };
  
      if (pct >= 75) {
        mastery.strong.push(topicData);
      } else if (pct >= 50) {
        mastery.medium.push(topicData);
      } else {
        mastery.weak.push(topicData);
      }
    }
  
    return mastery;
  }

  // for book progress bars
  export function getProgressByBook(books, attempts = []) {
    // list of lesson ids without dubplicates
    const completedLessonIds = new Set(
      attempts
        .filter((attempt) => attempt.lessonId)
        .map((attempt) => attempt.lessonId)
    );
  
    return Object.fromEntries(
      books.map((book) => {
        const totalLessons = book.lessonCount || 0;
  
        const completed = attempts.filter(
          (attempt) =>
            attempt.bookId === book.id &&
            attempt.lessonId &&
            completedLessonIds.has(attempt.lessonId)
        );
  
        const uniqueCompletedLessons = new Set(
          completed.map((attempt) => attempt.lessonId)
        ).size;
  
        const pct = totalLessons
          ? Math.round((uniqueCompletedLessons / totalLessons) * 100)
          : 0;
  
        let status = "Not started";
        if (uniqueCompletedLessons > 0 && uniqueCompletedLessons < totalLessons) {
          status = "In progress";
        }
        if (totalLessons > 0 && uniqueCompletedLessons === totalLessons) {
          status = "Completed";
        }
  
        return [
          book.id,
          {
            completed: uniqueCompletedLessons,
            total: totalLessons,
            pct,
            status,
          },
        ];
      })
    );
  }


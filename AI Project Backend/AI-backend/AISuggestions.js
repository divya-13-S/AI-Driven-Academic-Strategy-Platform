// 🤖 ADVANCED RULE-BASED AI SUGGESTIONS ENGINE
// Generates realistic, randomized suggestions based on completion %, marks, and exam dates

const generateSuggestions = (studentData) => {
  const { marks, topicsCompletion, examDate, subjects } = studentData;
  const suggestions = [];

  // Helper function to get random suggestion from array
  const getRandomSuggestion = (suggestionsArray) => {
    return suggestionsArray[Math.floor(Math.random() * suggestionsArray.length)];
  };

  // Calculate overall statistics
  const totalMarks = marks && marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
  const totalCompletion = topicsCompletion && topicsCompletion.length > 0 ?
    (topicsCompletion.filter(t => t.completed).length / topicsCompletion.length) * 100 : 0;

  // Calculate days until exam
  const daysUntilExam = examDate ? Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  // ===== OVERALL PERFORMANCE SUGGESTIONS =====

  // Rule A: Low Performance (avg marks < 50)
  if (totalMarks < 50) {
    const lowPerformanceSuggestions = [
      "Your overall performance needs improvement. Consider reviewing fundamental concepts and practicing more problems regularly.",
      "You're currently below average in your subjects. Try allocating more study time and seeking help with difficult topics.",
      "Performance is concerning across subjects. Focus on understanding core concepts before moving to advanced topics.",
      "Your marks suggest you need to strengthen your basics. Consider joining study groups or getting tutoring help.",
      "Overall grades are low. Create a daily study schedule and track your progress to improve gradually."
    ];
    suggestions.push({
      type: "overall_performance",
      category: "low_performance",
      suggestion: getRandomSuggestion(lowPerformanceSuggestions),
      priority: "high"
    });
  }

  // Rule B: Moderate Performance (50-75)
  else if (totalMarks >= 50 && totalMarks <= 75) {
    const moderatePerformanceSuggestions = [
      "You're doing okay but there's room for improvement. Focus on your weaker subjects to boost your overall average.",
      "Your performance is stable but could be better. Try solving more practice questions and reviewing mistakes.",
      "You're maintaining average grades. Consider studying smarter by focusing on high-impact topics.",
      "Performance is decent but inconsistent. Work on time management and regular revision to improve scores.",
      "You're on track but could aim higher. Identify your weak areas and dedicate extra time to them."
    ];
    suggestions.push({
      type: "overall_performance",
      category: "moderate_performance",
      suggestion: getRandomSuggestion(moderatePerformanceSuggestions),
      priority: "medium"
    });
  }

  // Rule C: High Performance (>75)
  else if (totalMarks > 75) {
    const highPerformanceSuggestions = [
      "Excellent work! You're performing very well. Keep maintaining this high standard and challenge yourself with advanced problems.",
      "Outstanding performance across subjects! Continue your effective study habits and consider helping classmates.",
      "You're doing exceptionally well. Stay consistent and focus on maintaining this level while exploring deeper concepts.",
      "Great job on your high scores! Keep up the momentum and consider taking on leadership roles in study groups.",
      "Your performance is top-notch. Continue practicing regularly and don't get complacent with your success."
    ];
    suggestions.push({
      type: "overall_performance",
      category: "high_performance",
      suggestion: getRandomSuggestion(highPerformanceSuggestions),
      priority: "low"
    });
  }

  // Rule D: Low Completion (<50%)
  if (totalCompletion < 50) {
    const lowCompletionSuggestions = [
      "You have many topics left to cover. Prioritize completing your syllabus systematically to avoid last-minute stress.",
      "Syllabus completion is low. Create a realistic study plan and focus on finishing pending units before exams.",
      "You're behind on topic completion. Dedicate more time to studying and consider extending your study hours.",
      "Many chapters are still pending. Break down your syllabus into smaller goals and track your daily progress.",
      "Completion rate is concerning. Focus on quality over quantity and ensure you understand concepts as you study."
    ];
    suggestions.push({
      type: "overall_completion",
      category: "low_completion",
      suggestion: getRandomSuggestion(lowCompletionSuggestions),
      priority: "high"
    });
  }

  // Rule E: Exam Near (within 3 days)
  if (daysUntilExam !== null && daysUntilExam <= 3 && daysUntilExam >= 0) {
    const examNearSuggestions = [
      "Exams are very close! Focus only on revision and avoid learning new topics. Practice with previous years' papers.",
      "Final days before exam. Prioritize important formulas, concepts, and quick revision. Get adequate rest.",
      "Assessment is imminent. Stop new learning and concentrate on recalling what you've studied. Stay calm and confident.",
      "Only a few days left. Review summaries, key points, and practice questions. Maintain a healthy routine.",
      "Exam preparation phase. Focus on weak areas, revise notes, and take mock tests. Believe in your preparation."
    ];
    suggestions.push({
      type: "overall_exam",
      category: "exam_near",
      suggestion: getRandomSuggestion(examNearSuggestions),
      priority: "critical"
    });
  }

  // ===== SUBJECT-WISE SUGGESTIONS =====

  // Process each subject if subjects data is available
  if (subjects && subjects.length > 0) {
    subjects.forEach(subject => {
      const subjectMarks = subject.marks || 0;
      const subjectCompletion = subject.completion || 0;
      const subjectExamDate = subject.examDate;
      const subjectDaysUntilExam = subjectExamDate ?
        Math.ceil((new Date(subjectExamDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

      const subjectSuggestions = [];

      // Rule set definitions for variety
      const rules = [
        {
          condition: subjectCompletion < 50 && subjectDaysUntilExam !== null && subjectDaysUntilExam <= 3 && subjectDaysUntilExam >= 0,
          variants: [
            `${subject.name}: exam in ${subjectDaysUntilExam} day(s). Complete key topics urgently, focus on high-weight units.`,
            `${subject.name}: low completion and upcoming exam. Keep revision targeted to the core syllabus and avoid distractions.`,
            `${subject.name}: exam is close; prioritize important concepts and solve at least one full paper today.`
          ]
        },
        {
          condition: subjectCompletion >= 70 && subjectMarks < 60,
          variants: [
            `${subject.name}: high completion but low marks. Solve more previous tests and review your errors thoroughly.`,
            `${subject.name}: good coverage but weak score. Work on application and timings in mock tests.`,
            `${subject.name}: align your learning with exam pattern; practice long-form problems for better retention.`
          ]
        },
        {
          condition: subjectCompletion < 50 && (subjectDaysUntilExam === null || subjectDaysUntilExam > 7),
          variants: [
            `${subject.name}: no immediate exam pressure; plan your remaining units across the coming weeks.`,
            `${subject.name}: use relaxed pace smartly: build concept clarity and fill gaps with quizzes.`,
            `${subject.name}: track daily progress; by completing 1 topic per day you can finish early.`
          ]
        },
        {
          condition: subjectMarks > 80,
          variants: [
            `${subject.name}: excellent score zone. Keep up your performance with regular advanced practice.`,
            `${subject.name}: strong marks! Continue with mock tests and peer teaching for deeper mastery.`,
            `${subject.name}: high performance sustained. Focus on top-tier questions and speed work.`,
          ]
        },
        {
          condition: subjectMarks >= 50 && subjectMarks <= 80,
          variants: [
            `${subject.name}: mid-range marks. Improve accuracy by regularly revising weak sections.`,
            `${subject.name}: stable performance. Concentrate on problem-solving consistency and error checks.`,
            `${subject.name}: average score; set small goals to improve by 2-4 points every unit.`
          ]
        },
        {
          condition: subjectDaysUntilExam !== null && subjectDaysUntilExam <= 2 && subjectDaysUntilExam >= 0,
          variants: [
            `${subject.name}: exam is very close – no new topics, revise summaries and rest well.`,
            `${subject.name}: last 48 hours. Sleep, quick formula checks, and one final practice packet.`,
            `${subject.name}: race to the finish line; choice concepts only, no heavy memorization now.`
          ]
        }
      ];

      // Collect unique suggestions based on all matching rules
      rules.forEach(rule => {
        if (rule.condition) {
          const suggestionText = getRandomSuggestion(rule.variants);
          if (!subjectSuggestions.includes(suggestionText)) {
            subjectSuggestions.push(suggestionText);
          }
        }
      });

      // Guarantee at least one subject-specific suggestion
      if (subjectSuggestions.length === 0) {
        subjectSuggestions.push(`${subject.name}: solid progress; continue your pattern and do frequent short tests for accuracy.`);
      }

      // Use 2 random unique suggestions each subject
      const finalSubjectSuggestions = subjectSuggestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      suggestions.push({
        type: "subject_specific",
        subject: subject.name,
        completion: subjectCompletion,
        marks: subjectMarks,
        examDate: subjectExamDate,
        suggestions: finalSubjectSuggestions
      });
    });
  }

  // If no specific suggestions generated, add a general encouragement
  if (suggestions.length === 0) {
    const generalSuggestions = [
      "Keep up the good work! Continue studying regularly and track your progress.",
      "You're on the right track. Stay consistent with your studies and seek help when needed.",
      "Maintain your study routine. Regular practice and revision will lead to better results.",
      "Good progress so far. Keep focusing on understanding concepts and practicing problems.",
      "Stay motivated! Consistent effort and smart study techniques will help you succeed."
    ];
    suggestions.push({
      type: "general_encouragement",
      suggestion: getRandomSuggestion(generalSuggestions),
      priority: "low"
    });
  }

  return suggestions;
};

module.exports = { generateSuggestions };

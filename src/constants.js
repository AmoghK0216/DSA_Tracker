export const topics = [
  { day: 1, name: "Arrays & Two Pointers", color: "bg-blue-500" },
  { day: 2, name: "Binary Search & Sorting", color: "bg-purple-500" },
  { day: 3, name: "Trees & Graphs", color: "bg-green-500" },
  { day: 4, name: "Dynamic Programming & Recursion", color: "bg-orange-500" },
  { day: 5, name: "Hash Maps, Stacks & Queues", color: "bg-pink-500" }
];

export const getDayFocus = (day) => {
  const focusTexts = {
    1: "Master sliding window patterns and two-pointer techniques. Focus on in-place operations.",
    2: "Practice identifying search spaces. Remember: if sorted or can sort, think binary search.",
    3: "Visualize the structure. Practice both DFS and BFS. Draw the tree/graph for complex problems.",
    4: "Start with recursion, then optimize with memoization. Identify overlapping subproblems.",
    5: "Think about what data structure fits best. Frequency? Use HashMap. Order matters? Stack/Queue."
  };
  return focusTexts[day] || "";
};

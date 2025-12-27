export const topics = [
  { day: 1, name: "Arrays, 2P & Slinding Window", color: "bg-blue-500" },
  { day: 2, name: "Binary Search & Sorting", color: "bg-purple-500" },
  { day: 3, name: "Trees & Graphs", color: "bg-app-accent" },
  { day: 4, name: "DP, Recursion & Backtracking", color: "bg-orange-500" },
  { day: 5, name: "Stacks, Queues & Greedy", color: "bg-pink-500" },
  { day: 6, name: "Strings & HashMaps", color: "bg-yellow-500"}
];

export const getDayFocus = (day) => {
  const focusTexts = {
    1: "Master sliding window patterns and two-pointer techniques. Focus on in-place operations.",
    2: "Practice identifying search spaces. Remember: if sorted or can sort, think binary search.",
    3: "Visualize the structure. Practice both DFS and BFS. Draw the tree/graph for complex problems.",
    4: "Start with recursion, then optimize with memoization. Identify overlapping subproblems.",
    5: "Think about processing order. Monotonic patterns for stacks. Top-K needs heaps. Greedy: locally optimal choices.",
    6: "Focus on frequency counting, pattern matching, and substring problems. HashMap is your best friend."
  };
  return focusTexts[day] || "";
};

"use client"

import React from 'react';
import { toast } from "sonner";
import { useMindmapStore } from "@/lib/store";
import { PromptInput } from "@/components/ui/prompt-input";
import { MindmapView } from "@/components/ui/mindmap-view";

const initValue = `# Grokking the Coding Interview

- ## Core Concept
  - Learn patterns, not individual problems
  - Systematic approach to problem-solving
  - Prepare for technical interviews efficiently

- ## Key Problem-Solving Patterns
  - ### 1. Sliding Window
    - Fixed-size window
    - Variable-size window
    - Examples: Max subarray sum, longest substring
  - ### 2. Two Pointers
    - Opposite ends approach
    - Fast and slow pointers
    - Examples: Pair with target sum, remove duplicates
  - ### 3. Fast and Slow Pointers (Cycle Detection)
    - Detect cycles in linked lists
    - Find middle of linked list
    - Examples: Linked list cycle, happy number
  - ### 4. Merge Intervals
    - Overlapping intervals
    - Non-overlapping intervals
    - Examples: Merge intervals, interval intersection
  - ### 5. Cyclic Sort
    - Sort in-place with O(n)
    - Find missing/corrupt numbers
    - Examples: Find missing number, find duplicates
  - ### 6. In-Place Linked List Reversal
    - Reverse entire list
    - Reverse sublist
    - Examples: Reverse linked list, reverse k nodes
  - ### 7. Breadth-First Search (BFS)
    - Level-order traversal
    - Shortest path in graphs/trees
    - Examples: Binary tree level order, minimum depth
  - ### 8. Depth-First Search (DFS)
    - Explore all paths
    - Backtracking
    - Examples: Path sum, all paths in tree
  - ### 9. Two Heaps
    - Min-heap and max-heap combo
    - Median in a stream
    - Examples: Find median, sliding window median
  - ### 10. Subsets
    - Generate all subsets
    - Permutations and combinations
    - Examples: Subsets, permutations
  - ### 11. Modified Binary Search
    - Search in sorted array
    - Handle rotations
    - Examples: Search in rotated array, find peak
  - ### 12. Top K Elements
    - Use heaps or quickselect
    - Frequent elements
    - Examples: Top k frequent, kth largest
  - ### 13. K-way Merge
    - Merge multiple sorted lists
    - Priority queue usage
    - Examples: Merge k sorted lists, smallest range
  - ### 14. Topological Sort
    - Directed acyclic graph (DAG)
    - Dependency resolution
    - Examples: Course schedule, alien dictionary

- ## Problem-Solving Strategies
  - Understand the problem
  - Identify the pattern
  - Write pseudocode first
  - Optimize space and time complexity

- ## Key Takeaways
  - Practice pattern recognition
  - Time management in interviews
  - Master data structures (arrays, lists, trees, heaps)
`;

export default function MarkmapHooks() {
  const { prompt, setPrompt, isLoading, setIsLoading, mindmapData, setMindmapData } = useMindmapStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsLoading(true);
    toast.loading("AI is thinking...");
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMindmapData(prompt);
      toast.success("Mindmap generated successfully!");
    } catch (error) {
      toast.error("Failed to generate mindmap");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex flex-col w-full h-[calc(85vh-8rem)] rounded-xl">
      <div className="flex-1 overflow-hidden mb-24">
        <MindmapView data={mindmapData || initValue} />
      </div>
      <div className="fixed bottom-6 left-6 right-6 z-10">
        <PromptInput
          value={prompt}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

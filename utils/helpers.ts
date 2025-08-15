export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function getDayOfWeekName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[(dayNumber - 1) % 7];
}

export function calculateEstimated1RM(weight: number, reps: number): number {
  // Brzycki formula
  return weight * (36 / (37 - reps));
}

export function getRecommendedWeight(previousWeight: number, previousReps: number, previousRIR: number, targetReps: number, targetRIR: number, difficulty: number): number {
  // This is a simplified version of the recommendation engine
  // In a real app, this would be more sophisticated
  
  if (difficulty === 4) { // Too much
    return previousWeight * 0.9; // Reduce by 10%
  }
  
  if (previousReps > targetReps && previousRIR <= targetRIR) {
    // Beat the target, increase weight
    return previousWeight * 1.05; // Increase by 5%
  }
  
  if (previousReps === targetReps && previousRIR === targetRIR && difficulty === 2) {
    // Met the target exactly with "Pretty Good" difficulty, keep same weight
    return previousWeight;
  }
  
  if (previousReps < targetReps || previousRIR > targetRIR) {
    // Failed to meet target, decrease weight
    return previousWeight * 0.95; // Decrease by 5%
  }
  
  return previousWeight; // Default: keep the same weight
}
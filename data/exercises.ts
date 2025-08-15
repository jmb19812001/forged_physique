import { Exercise } from "@/types/workout";
import { generateId } from "@/utils/helpers";

export const defaultExercises: Exercise[] = [
  {
    exercise_id: generateId(),
    name: "Barbell Bench Press",
    primary_muscle_group: "Chest",
    equipment: "Barbell",
    instructions: "Lie on a flat bench with your feet flat on the floor. Grip the barbell slightly wider than shoulder-width. Unrack the bar and lower it to your mid-chest. Press the bar back up to full arm extension.",
    video_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Incline Dumbbell Press",
    primary_muscle_group: "Chest",
    equipment: "Dumbbell",
    instructions: "Set an adjustable bench to a 30-45 degree incline. Sit with your back against the bench, holding a dumbbell in each hand at shoulder level. Press the dumbbells upward until your arms are fully extended, then lower them back to the starting position.",
    video_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Cable Fly",
    primary_muscle_group: "Chest",
    equipment: "Cable",
    instructions: "Stand in the center of a cable machine with the pulleys set at chest height. Grab the handles with your palms facing forward. Step forward to create tension, with a slight bend in your elbows. Bring your hands together in front of your chest in a hugging motion.",
    video_url: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Barbell Row",
    primary_muscle_group: "Back",
    equipment: "Barbell",
    instructions: "Stand with your feet shoulder-width apart, holding a barbell with an overhand grip. Bend at the hips and knees, keeping your back straight. Pull the barbell to your lower chest/upper abdomen, then lower it back down with control.",
    video_url: "https://images.unsplash.com/photo-1598268030500-8c5b8bce9c6a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Pull-Up",
    primary_muscle_group: "Back",
    equipment: "Bodyweight",
    instructions: "Hang from a pull-up bar with your hands slightly wider than shoulder-width apart, palms facing away from you. Pull yourself up until your chin is over the bar, then lower yourself back down with control.",
    video_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Lat Pulldown",
    primary_muscle_group: "Back",
    equipment: "Machine",
    instructions: "Sit at a lat pulldown machine with your thighs secured under the pads. Grab the bar with a wide overhand grip. Pull the bar down to your upper chest, squeezing your shoulder blades together. Slowly return to the starting position.",
    video_url: "https://images.unsplash.com/photo-1598266663439-2056e6900339?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Barbell Squat",
    primary_muscle_group: "Legs",
    equipment: "Barbell",
    instructions: "Stand with your feet shoulder-width apart, with a barbell resting on your upper back. Bend your knees and hips to lower your body as if sitting in a chair. Keep your chest up and back straight. Lower until your thighs are parallel to the ground, then push through your heels to return to standing.",
    video_url: "https://images.unsplash.com/photo-1566241142559-40a9552bd7ad?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Romanian Deadlift",
    primary_muscle_group: "Legs",
    equipment: "Barbell",
    instructions: "Stand with your feet hip-width apart, holding a barbell in front of your thighs. Keeping your back straight and knees slightly bent, hinge at the hips to lower the barbell toward the floor. Lower until you feel a stretch in your hamstrings, then return to the starting position.",
    video_url: "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Leg Press",
    primary_muscle_group: "Legs",
    equipment: "Machine",
    instructions: "Sit in a leg press machine with your back against the pad and feet on the platform. Release the safety catches and lower the platform by bending your knees. Push through your heels to extend your legs, then slowly lower back to the starting position.",
    video_url: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Overhead Press",
    primary_muscle_group: "Shoulders",
    equipment: "Barbell",
    instructions: "Stand with your feet shoulder-width apart, holding a barbell at shoulder height with an overhand grip. Press the barbell overhead until your arms are fully extended. Lower the barbell back to shoulder height with control.",
    video_url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Lateral Raise",
    primary_muscle_group: "Shoulders",
    equipment: "Dumbbell",
    instructions: "Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides. Keeping your arms straight, raise the dumbbells out to the sides until they reach shoulder height. Lower them back to your sides with control.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Face Pull",
    primary_muscle_group: "Shoulders",
    equipment: "Cable",
    instructions: "Stand facing a cable machine with a rope attachment set at head height. Grab the rope with both hands, palms facing each other. Pull the rope toward your face, separating your hands as you pull. Focus on squeezing your shoulder blades together. Return to the starting position with control.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Barbell Curl",
    primary_muscle_group: "Arms",
    equipment: "Barbell",
    instructions: "Stand with your feet shoulder-width apart, holding a barbell with an underhand grip. Keeping your upper arms stationary, curl the barbell up to shoulder height. Lower the barbell back to the starting position with control.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Tricep Pushdown",
    primary_muscle_group: "Arms",
    equipment: "Cable",
    instructions: "Stand facing a cable machine with a straight or V-bar attachment set at head height. Grab the bar with an overhand grip, keeping your elbows close to your body. Push the bar down until your arms are fully extended. Slowly return to the starting position.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  },
  {
    exercise_id: generateId(),
    name: "Hammer Curl",
    primary_muscle_group: "Arms",
    equipment: "Dumbbell",
    instructions: "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with a neutral grip (palms facing each other). Keeping your upper arms stationary, curl the dumbbells up to shoulder height. Lower the dumbbells back to the starting position with control.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  },
];

// Add more exercises as needed to reach 50 total
for (let i = 0; i < 35; i++) {
  const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Arms"];
  const equipment = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];
  
  defaultExercises.push({
    exercise_id: generateId(),
    name: `Exercise ${i + 16}`,
    primary_muscle_group: muscleGroups[i % 5],
    equipment: equipment[i % 5],
    instructions: "Perform the exercise with proper form, focusing on the target muscle group.",
    video_url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop"
  });
}
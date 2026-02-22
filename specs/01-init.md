I want to create an application to monitor my weightlifting workouts. Each day of the week will have a specific training plan. For example, I’ll train chest on Monday, legs on Tuesday, and so on, with rest days included. This schedule should be flexible; if I miss my workout on Monday, I can do it on Tuesday instead, but I can also skip to the Tuesday workout if I prefer.

Each workout will consist of multiple exercises. For instance, in a typical upper body A workout, I will specify the number of sets, repetitions, and rest time for each exercise. The number of repetitions can vary, such as from 5 to 8, and the rest time can be in a range, like 90 seconds to 3 minutes. Each workout may contain several exercises, each with its own set of parameters.

When I start a workout, a page should open displaying one exercise at a time, in the prescribed order. Preserving this order is important, along with providing fields for entering the number of sets, repetitions, and the weight lifted for each exercise. This core functionality is crucial since it allows users to track their performance accurately.

Users should also be able to navigate between exercises freely and switch to different exercises if they can’t complete the planned one. This change must be recorded in the app.

Additionally, I want a calendar icon for tracking workouts. This calendar will indicate which days I trained, with a special marker for those days. There should be two tabs: one for workouts and another for exercises. From the exercises tab, I want to see my progress displayed in a line graph using the Recharts library. Below the graph, there should also be a table listing the dates, workout names, weights, and repetitions I completed.

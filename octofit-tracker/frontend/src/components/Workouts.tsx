import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason?: string };
type WorkoutResponse = { suggestions: Workout[] };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<WorkoutResponse>('/api/workouts/suggestions/mona%40example.com')
      .then((response) => setSuggestions(response.suggestions))
      .catch(() => setError('Unable to load workout suggestions.'))
  }, []);

  return (
    <main>
      <h2>Workout suggestions</h2>
      {error ? <p role="alert">{error}</p> : suggestions === null ? <p role="status">Loading workout suggestions...</p> : suggestions.length === 0 ? <p>No workout suggestions yet.</p> : (
        <div className="row g-3">
          {suggestions.map((workout) => <section className="col-md-6" key={workout.title}><div className="card"><div className="card-body"><h3 className="h5">{workout.title}</h3><p>{workout.focus} · {workout.minutes} minutes · {workout.difficulty}</p>{workout.reason && <p>{workout.reason}</p>}</div></div></section>)}
        </div>
      )}
    </main>
  );
}

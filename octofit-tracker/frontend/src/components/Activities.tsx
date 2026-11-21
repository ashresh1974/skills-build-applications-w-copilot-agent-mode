import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = { type: string; minutes: number; points: number };
type ActivityResponse = { activities: Activity[] };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<ActivityResponse>('/api/activities')
      .then((response) => setActivities(response.activities))
      .catch(() => setError('Unable to load activities.'))
  }, []);

  return (
    <main>
      <h2>Activities</h2>
      {error ? <p role="alert">{error}</p> : activities === null ? <p role="status">Loading activities...</p> : activities.length === 0 ? <p>No activities yet.</p> : (
        <ul className="list-group">
          {activities.map((activity, index) => <li className="list-group-item" key={`${activity.type}-${index}`}>{activity.type}: {activity.minutes} minutes ({activity.points} points)</li>)}
        </ul>
      )}
    </main>
  );
}

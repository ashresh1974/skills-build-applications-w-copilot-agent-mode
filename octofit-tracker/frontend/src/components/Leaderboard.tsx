import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };
type LeaderboardResponse = { leaderboard: LeaderboardEntry[] };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((response) => setLeaderboard(response.leaderboard))
      .catch(() => setError('Unable to load leaderboard.'))
  }, []);

  return (
    <main>
      <h2>Leaderboard</h2>
      {error ? <p role="alert">{error}</p> : leaderboard === null ? <p role="status">Loading leaderboard...</p> : leaderboard.length === 0 ? <p>No leaderboard scores yet.</p> : (
        <ol className="list-group list-group-numbered">
          {leaderboard.map((entry) => <li className="list-group-item d-flex justify-content-between" key={entry.teamName}><span>{entry.teamName}</span><strong>{entry.totalPoints} points</strong></li>)}
        </ol>
      )}
    </main>
  );
}

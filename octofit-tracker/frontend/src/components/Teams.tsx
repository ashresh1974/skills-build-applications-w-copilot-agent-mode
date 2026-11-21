import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = { name: string; mascot: string; members: string[] };
type TeamResponse = { teams: Team[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<TeamResponse>('/api/teams')
      .then((response) => setTeams(response.teams))
      .catch(() => setError('Unable to load teams.'))
  }, []);

  return (
    <main>
      <h2>Teams</h2>
      {error ? <p role="alert">{error}</p> : teams === null ? <p role="status">Loading teams...</p> : teams.length === 0 ? <p>No teams yet.</p> : (
        <div className="row g-3">
          {teams.map((team) => <section className="col-md-6" key={team.name}><div className="card"><div className="card-body"><h3 className="h5">{team.name}</h3><p>Mascot: {team.mascot}</p><p>Members: {team.members.length}</p></div></div></section>)}
        </div>
      )}
    </main>
  );
}

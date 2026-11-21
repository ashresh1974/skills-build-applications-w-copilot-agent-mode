import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type ApiInput = Record<string, unknown>;

function isRecord(input: unknown): input is ApiInput {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function apiError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input) || !isValidId(input.userId) || !isValidId(input.teamId) || typeof input.type !== 'string' || !input.type.trim() || typeof input.minutes !== 'number' || !Number.isFinite(input.minutes) || input.minutes <= 0) {
    throw apiError(400, 'userId, teamId, type, and positive minutes are required');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: input.userId }),
    Team.exists({ _id: input.teamId }),
  ]);
  if (!user || !team) throw apiError(404, 'User or team not found');

  const activity = await Activity.create({
    user: input.userId,
    team: input.teamId,
    type: input.type.trim(),
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim() || typeof input.mascot !== 'string' || !input.mascot.trim()) {
    throw apiError(400, 'name and mascot are required');
  }
  if (input.members !== undefined && (!Array.isArray(input.members) || !input.members.every(isValidId))) {
    throw apiError(400, 'members must contain valid user IDs');
  }

  const team = await Team.create({
    name: input.name.trim(),
    mascot: input.mascot.trim(),
    members: input.members ?? [],
  });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((total) => total._id) } }).select('_id name').lean();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals
    .filter((total) => names.has(total._id.toString()))
    .map((total, index) => ({
      teamName: names.get(total._id.toString()) as string,
      totalPoints: total.totalPoints,
      rank: index + 1,
    }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw apiError(404, 'User not found');

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus = recentActivity
    ? ({ run: 'endurance', cycle: 'endurance', strength: 'strength', walk: 'mobility' } as Record<string, string>)[recentActivity.type] ?? recentActivity.type
    : undefined;
  const preferredFocus = user.fitnessGoal || activityFocus;
  const workouts = await Workout.find().lean();

  return workouts
    .sort((left, right) => Number(right.focus === preferredFocus) - Number(left.focus === preferredFocus))
    .map((workout) => ({
      ...workout,
      reason: workout.focus === preferredFocus
        ? `Matches the user's ${preferredFocus} goal or recent activity.`
        : 'Provides variety beyond the recent activity pattern.',
    }));
}

export { User };

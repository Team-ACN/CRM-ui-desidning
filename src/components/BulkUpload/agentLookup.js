import { mockAgents } from '../../data/mockAgents';

const AGENTS_BY_CP_ID = mockAgents.reduce(
  (agents, agent) => ({ ...agents, [String(agent.agentId).toUpperCase()]: agent }),
  {},
);

export const findAgentByCpId = (cpId) => AGENTS_BY_CP_ID[String(cpId).trim().toUpperCase()] ?? null;

/** CP IDs in the file that match no agent — reported once per file, not per row. */
export const collectUnknownCpIds = (validatedRows) => [
  ...new Set(
    validatedRows
      .map((row) => row.values.cpId)
      .filter((cpId) => cpId !== '' && !findAgentByCpId(cpId)),
  ),
];

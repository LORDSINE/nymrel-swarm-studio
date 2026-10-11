import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SwarmStore } from '../src/state/swarmStore';
import { computeMerkleRoot, computeSha256 } from '../src/mock/merkle';

describe('browser-only store transitions', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts fixture playback only while subscribed', () => {
    const store = new SwarmStore();
    const initial = store.getState().agents[0]!.totalTokens;
    const unsubscribe = store.subscribe(() => undefined);
    vi.advanceTimersByTime(2_000);
    expect(store.getState().agents[0]!.totalTokens).toBeGreaterThan(initial);

    unsubscribe();
    const stopped = store.getState().agents[0]!.totalTokens;
    vi.advanceTimersByTime(4_000);
    expect(store.getState().agents[0]!.totalTokens).toBe(stopped);
  });

  it('records fixture-only approval, rejection, diff, and file transitions', () => {
    const store = new SwarmStore();
    const gate = store.getState().cards.find(card => card.type === 'approval-gate');
    const diff = store.getState().cards.find(card => card.type === 'diff-viewer');
    const file = store.getState().workspaceFiles[0];
    expect(gate && diff && file).toBeTruthy();

    store.approveGate(gate!.id);
    expect(store.getState().cards.find(card => card.id === gate!.id)).toMatchObject({ status: 'approved' });
    expect(store.getState().toastMessage).toContain('Nothing was executed');

    store.resetDemo();
    store.rejectGate(gate!.id);
    expect(store.getState().agents.find(agent => agent.id === gate!.agentId)).toMatchObject({ status: 'blocked' });
    expect(store.getState().scenarioLogs[0]).toMatchObject({ decision: 'BLOCK' });

    store.acceptDiffHunk(diff!.id, diff!.hunks[0]!.hunkId);
    expect(store.getState().toastMessage).toContain('No file was written');
    store.dismissFileScenario(file!.path);
    expect(store.getState().workspaceFiles.some(item => item.path === file!.path)).toBe(false);
  });

  it.each([
    ['approveGate', 'approved', 1],
    ['rejectGate', 'rejected', 1],
    ['sandboxGate', 'sandboxed', 0],
  ] as const)('keeps the first %s decision until the fixture is reset', (method, status, addedLogs) => {
    const store = new SwarmStore();
    const gate = store.getState().cards.find(card => card.type === 'approval-gate')!;
    const initialLogs = store.getState().scenarioLogs.length;

    store[method](gate.id);
    const resolvedState = store.getState();
    expect(resolvedState.cards.find(card => card.id === gate.id)).toMatchObject({ status });
    expect(resolvedState.scenarioLogs).toHaveLength(initialLogs + addedLogs);

    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    for (const repeat of ['approveGate', 'rejectGate', 'sandboxGate'] as const) {
      store[repeat](gate.id);
      expect(store.getState()).toBe(resolvedState);
    }
    expect(listener).not.toHaveBeenCalled();

    store.resetDemo();
    store[method](gate.id);
    expect(store.getState().cards.find(card => card.id === gate.id)).toMatchObject({ status });
    expect(store.getState().scenarioLogs).toHaveLength(initialLogs + addedLogs);
    unsubscribe();
  });

  it.each(['approveGate', 'rejectGate', 'sandboxGate'] as const)(
    'ignores missing or non-gate cards in %s without reporting a decision',
    method => {
      const store = new SwarmStore();
      const initialState = store.getState();
      const ballot = initialState.cards.find(card => card.type === 'decision-ballot')!;

      store[method]('missing-gate');
      expect(store.getState()).toBe(initialState);
      store[method](ballot.id);
      expect(store.getState()).toBe(initialState);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('records hashes that can be independently recomputed', () => {
    const store = new SwarmStore();
    const priorLeaves = [...store.getState().scenarioLogs]
      .reverse()
      .map(log => log.localDigest.leafHash);
    const event = store.recordScenarioEvent({
      agentId: 'example',
      agentName: 'Example worker',
      actionType: 'network_egress',
      target: 'https://example.invalid',
      decision: 'SANDBOX',
      policyRule: 'EXAMPLE',
      riskScore: 50,
      payloadSummary: 'Synthetic event.',
    });

    expect(event.localDigest.leafHash).toBe(computeSha256({
      agentId: event.agentId,
      actionType: event.actionType,
      target: event.target,
      decision: event.decision,
      timestamp: event.timestamp,
    }));
    expect(event.localDigest.currentRoot).toBe(computeMerkleRoot([...priorLeaves, event.localDigest.leafHash]));
  });
});

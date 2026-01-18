import { mkdir, readdir, readFile, writeFile, rename } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { SessionState, Phase, ApprovalRecord } from '../types.js';

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Create a new empty session state
 */
function createEmptySession(): SessionState {
  return {
    id: generateSessionId(),
    themeName: '',
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
    currentPhase: 'brief',
    completedPhases: [],
    brief: null,
    products: [],
    sections: [],
    designSystem: null,
    testResults: [],
    submissionAssets: null,
    approvalHistory: [],
  };
}

/**
 * Session Manager - handles session persistence and resume
 */
export class SessionManager {
  private sessionsDir: string;

  constructor(sessionsDir: string) {
    this.sessionsDir = sessionsDir;
  }

  /**
   * Ensure sessions directory exists
   */
  private async ensureDir(): Promise<void> {
    if (!existsSync(this.sessionsDir)) {
      await mkdir(this.sessionsDir, { recursive: true });
    }
  }

  /**
   * Get path for a session file
   */
  private getSessionPath(sessionId: string): string {
    return join(this.sessionsDir, `${sessionId}.json`);
  }

  /**
   * Create a new session
   */
  async createSession(): Promise<SessionState> {
    await this.ensureDir();
    const session = createEmptySession();
    await this.saveSession(session);
    return session;
  }

  /**
   * Save session to disk
   */
  async saveSession(session: SessionState): Promise<void> {
    await this.ensureDir();
    session.lastUpdatedAt = new Date();

    const sessionPath = this.getSessionPath(session.id);
    const content = JSON.stringify(session, null, 2);

    await writeFile(sessionPath, content, 'utf-8');
  }

  /**
   * Load a session from disk
   */
  async loadSession(sessionId: string): Promise<SessionState> {
    const sessionPath = this.getSessionPath(sessionId);
    const content = await readFile(sessionPath, 'utf-8');
    const session = JSON.parse(content) as SessionState;

    // Convert date strings back to Date objects
    session.startedAt = new Date(session.startedAt);
    session.lastUpdatedAt = new Date(session.lastUpdatedAt);
    session.approvalHistory = session.approvalHistory.map((record) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }));

    // Ensure completedPhases exists for older sessions
    if (!session.completedPhases) {
      session.completedPhases = [];
    }

    return session;
  }

  /**
   * List all available sessions
   */
  async listSessions(): Promise<
    Array<{
      id: string;
      themeName?: string;
      lastUpdatedAt: Date;
      currentPhase: string;
    }>
  > {
    await this.ensureDir();

    try {
      const files = await readdir(this.sessionsDir);
      const sessions = await Promise.all(
        files
          .filter((f) => f.endsWith('.json'))
          .map(async (file) => {
            try {
              const content = await readFile(
                join(this.sessionsDir, file),
                'utf-8'
              );
              const session = JSON.parse(content) as SessionState;
              return {
                id: session.id,
                themeName: session.themeName || undefined,
                lastUpdatedAt: new Date(session.lastUpdatedAt),
                currentPhase: session.currentPhase,
              };
            } catch {
              return null;
            }
          })
      );

      return sessions
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime());
    } catch {
      return [];
    }
  }

  /**
   * Archive a completed session
   */
  async archiveSession(sessionId: string): Promise<void> {
    const archiveDir = join(this.sessionsDir, 'archive');
    if (!existsSync(archiveDir)) {
      await mkdir(archiveDir, { recursive: true });
    }

    const currentPath = this.getSessionPath(sessionId);
    const archivePath = join(archiveDir, `${sessionId}.json`);

    await rename(currentPath, archivePath);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId);
    const { unlink } = await import('fs/promises');
    await unlink(sessionPath);
  }

  /**
   * Add approval record to session
   */
  addApprovalRecord(
    session: SessionState,
    record: ApprovalRecord
  ): void {
    session.approvalHistory.push(record);
  }

  /**
   * Get approval history for a phase
   */
  getPhaseHistory(session: SessionState, phase: Phase): ApprovalRecord[] {
    return session.approvalHistory.filter((r) => r.phase === phase);
  }

  /**
   * Get approval history for a specific step
   */
  getStepHistory(
    session: SessionState,
    phase: Phase,
    step: string
  ): ApprovalRecord[] {
    return session.approvalHistory.filter(
      (r) => r.phase === phase && r.step === step
    );
  }

  /**
   * Check if a step was previously accepted
   */
  wasStepAccepted(
    session: SessionState,
    phase: Phase,
    step: string
  ): boolean {
    const history = this.getStepHistory(session, phase, step);
    return history.some((r) => r.accepted);
  }
}

export default SessionManager;

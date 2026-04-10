import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAppMock,
  createDbMock,
  createEmbeddedPostgresLogBufferMock,
  detectPortMock,
  embeddedPostgresInitialiseMock,
  embeddedPostgresStartMock,
  ensurePostgresDatabaseMock,
  feedbackExportServiceMock,
  feedbackServiceFactoryMock,
  fakeServer,
  formatEmbeddedPostgresErrorMock,
  inspectMigrationsMock,
  loadConfigMock,
  loggerMock,
  readPostmasterOptsPortMock,
  readPostmasterPidPortMock,
  readRunningPostmasterPidMock,
  tryAdoptEmbeddedPostgresClusterMock,
} = vi.hoisted(() => {
  const createAppMock = vi.fn(async () => ((_: unknown, __: unknown) => {}) as never);
  const createDbMock = vi.fn(() => ({}) as never);
  const createEmbeddedPostgresLogBufferMock = vi.fn(() => ({
    append: vi.fn(),
    getRecentLogs: vi.fn(() => []),
  }));
  const detectPortMock = vi.fn(async (port: number) => port);
  const embeddedPostgresInitialiseMock = vi.fn(async () => undefined);
  const embeddedPostgresStartMock = vi.fn(async () => undefined);
  const ensurePostgresDatabaseMock = vi.fn(async () => "exists");
  const feedbackExportServiceMock = {
    flushPendingFeedbackTraces: vi.fn(async () => ({ attempted: 0, sent: 0, failed: 0 })),
  };
  const feedbackServiceFactoryMock = vi.fn(() => feedbackExportServiceMock);
  const fakeServer = {
    once: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    listen: vi.fn((_port: number, _host: string, callback?: () => void) => {
      callback?.();
      return fakeServer;
    }),
    close: vi.fn(),
  };
  const formatEmbeddedPostgresErrorMock = vi.fn((err: unknown) => err);
  const inspectMigrationsMock = vi.fn(async () => ({ status: "upToDate" }));
  const loadConfigMock = vi.fn(() => ({
    deploymentMode: "authenticated",
    deploymentExposure: "private",
    host: "127.0.0.1",
    port: 3210,
    allowedHostnames: [],
    authBaseUrlMode: "auto",
    authPublicBaseUrl: undefined,
    authDisableSignUp: false,
    databaseMode: "postgres",
    databaseUrl: "postgres://paperclip:paperclip@127.0.0.1:5432/paperclip",
    embeddedPostgresDataDir: "/tmp/paperclip-test-db",
    embeddedPostgresPort: 54329,
    databaseBackupEnabled: false,
    databaseBackupIntervalMinutes: 60,
    databaseBackupRetentionDays: 30,
    databaseBackupDir: "/tmp/paperclip-test-backups",
    serveUi: false,
    uiDevMiddleware: false,
    secretsProvider: "local_encrypted",
    secretsStrictMode: false,
    secretsMasterKeyFilePath: "/tmp/paperclip-master.key",
    storageProvider: "local_disk",
    storageLocalDiskBaseDir: "/tmp/paperclip-storage",
    storageS3Bucket: "paperclip-test",
    storageS3Region: "us-east-1",
    storageS3Endpoint: undefined,
    storageS3Prefix: "",
    storageS3ForcePathStyle: false,
    feedbackExportBackendUrl: "https://telemetry.example.com",
    feedbackExportBackendToken: "telemetry-token",
    heartbeatSchedulerEnabled: false,
    heartbeatSchedulerIntervalMs: 30000,
    companyDeletionEnabled: false,
    telemetryEnabled: false,
    extensions: {},
  }));
  const loggerMock = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const readPostmasterOptsPortMock = vi.fn(() => null);
  const readPostmasterPidPortMock = vi.fn(() => null);
  const readRunningPostmasterPidMock = vi.fn(() => null);
  const tryAdoptEmbeddedPostgresClusterMock = vi.fn(async () => null);

  return {
    createAppMock,
    createDbMock,
    createEmbeddedPostgresLogBufferMock,
    detectPortMock,
    embeddedPostgresInitialiseMock,
    embeddedPostgresStartMock,
    ensurePostgresDatabaseMock,
    feedbackExportServiceMock,
    feedbackServiceFactoryMock,
    fakeServer,
    formatEmbeddedPostgresErrorMock,
    inspectMigrationsMock,
    loadConfigMock,
    loggerMock,
    readPostmasterOptsPortMock,
    readPostmasterPidPortMock,
    readRunningPostmasterPidMock,
    tryAdoptEmbeddedPostgresClusterMock,
  };
});

vi.mock("node:http", () => ({
  createServer: vi.fn(() => fakeServer),
}));

vi.mock("detect-port", () => ({
  default: detectPortMock,
}));

vi.mock("@paperclipai/db", () => ({
  createDb: createDbMock,
  ensurePostgresDatabase: ensurePostgresDatabaseMock,
  formatEmbeddedPostgresError: formatEmbeddedPostgresErrorMock,
  getPostgresDataDirectory: vi.fn(),
  inspectMigrations: inspectMigrationsMock,
  applyPendingMigrations: vi.fn(),
  reconcilePendingMigrationHistory: vi.fn(async () => ({ repairedMigrations: [] })),
  createEmbeddedPostgresLogBuffer: createEmbeddedPostgresLogBufferMock,
  formatDatabaseBackupResult: vi.fn(() => "ok"),
  runDatabaseBackup: vi.fn(),
  readPostmasterOptsPort: readPostmasterOptsPortMock,
  readPostmasterPidPort: readPostmasterPidPortMock,
  readRunningPostmasterPid: readRunningPostmasterPidMock,
  tryAdoptEmbeddedPostgresCluster: tryAdoptEmbeddedPostgresClusterMock,
  authUsers: {},
  companies: {},
  companyMemberships: {},
  instanceUserRoles: {},
}));

vi.mock("../app.js", () => ({
  createApp: createAppMock,
}));

vi.mock("../config.js", () => ({
  loadConfig: loadConfigMock,
}));

vi.mock("../middleware/logger.js", () => ({
  logger: loggerMock,
}));

vi.mock("embedded-postgres", () => ({
  default: class MockEmbeddedPostgres {
    async initialise() {
      await embeddedPostgresInitialiseMock();
    }

    async start() {
      await embeddedPostgresStartMock();
    }

    async stop() {
      return undefined;
    }
  },
}));

vi.mock("../realtime/live-events-ws.js", () => ({
  setupLiveEventsWebSocketServer: vi.fn(),
}));

vi.mock("../services/index.js", () => ({
  feedbackService: feedbackServiceFactoryMock,
  heartbeatService: vi.fn(() => ({
    reapOrphanedRuns: vi.fn(async () => undefined),
    resumeQueuedRuns: vi.fn(async () => undefined),
    tickTimers: vi.fn(async () => ({ enqueued: 0 })),
  })),
  reconcilePersistedRuntimeServicesOnStartup: vi.fn(async () => ({ reconciled: 0 })),
  routineService: vi.fn(() => ({
    tickScheduledTriggers: vi.fn(async () => ({ triggered: 0 })),
  })),
}));

vi.mock("../storage/index.js", () => ({
  createStorageServiceFromConfig: vi.fn(() => ({ id: "storage-service" })),
}));

vi.mock("../services/feedback-share-client.js", () => ({
  createFeedbackTraceShareClientFromConfig: vi.fn(() => ({ id: "feedback-share-client" })),
}));

vi.mock("../startup-banner.js", () => ({
  printStartupBanner: vi.fn(),
}));

vi.mock("../board-claim.js", () => ({
  getBoardClaimWarningUrl: vi.fn(() => null),
  initializeBoardClaimChallenge: vi.fn(async () => undefined),
}));

vi.mock("../auth/better-auth.js", () => ({
  createBetterAuthHandler: vi.fn(() => undefined),
  createBetterAuthInstance: vi.fn(() => ({})),
  deriveAuthTrustedOrigins: vi.fn(() => []),
  resolveBetterAuthSession: vi.fn(async () => null),
  resolveBetterAuthSessionFromHeaders: vi.fn(async () => null),
}));

import { startServer } from "../index.ts";

describe("startServer feedback export wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BETTER_AUTH_SECRET = "test-secret";
    loadConfigMock.mockReturnValue({
      deploymentMode: "authenticated",
      deploymentExposure: "private",
      host: "127.0.0.1",
      port: 3210,
      allowedHostnames: [],
      authBaseUrlMode: "auto",
      authPublicBaseUrl: undefined,
      authDisableSignUp: false,
      databaseMode: "postgres",
      databaseUrl: "postgres://paperclip:paperclip@127.0.0.1:5432/paperclip",
      embeddedPostgresDataDir: "/tmp/paperclip-test-db",
      embeddedPostgresPort: 54329,
      databaseBackupEnabled: false,
      databaseBackupIntervalMinutes: 60,
      databaseBackupRetentionDays: 30,
      databaseBackupDir: "/tmp/paperclip-test-backups",
      serveUi: false,
      uiDevMiddleware: false,
      secretsProvider: "local_encrypted",
      secretsStrictMode: false,
      secretsMasterKeyFilePath: "/tmp/paperclip-master.key",
      storageProvider: "local_disk",
      storageLocalDiskBaseDir: "/tmp/paperclip-storage",
      storageS3Bucket: "paperclip-test",
      storageS3Region: "us-east-1",
      storageS3Endpoint: undefined,
      storageS3Prefix: "",
      storageS3ForcePathStyle: false,
      feedbackExportBackendUrl: "https://telemetry.example.com",
      feedbackExportBackendToken: "telemetry-token",
      heartbeatSchedulerEnabled: false,
      heartbeatSchedulerIntervalMs: 30000,
      companyDeletionEnabled: false,
      telemetryEnabled: false,
      extensions: {},
    });
  });

  it("passes the feedback export service into createApp so pending traces flush in runtime", async () => {
    const started = await startServer();

    expect(started.server).toBe(fakeServer);
    expect(feedbackServiceFactoryMock).toHaveBeenCalledTimes(1);
    expect(createAppMock).toHaveBeenCalledTimes(1);
    expect(createAppMock.mock.calls[0]?.[1]).toMatchObject({
      feedbackExportService: feedbackExportServiceMock,
      storageService: { id: "storage-service" },
      serverPort: 3210,
    });
  });

  it("retries transient embedded postgres startup errors before continuing", async () => {
    loadConfigMock.mockReturnValue({
      deploymentMode: "authenticated",
      deploymentExposure: "private",
      host: "127.0.0.1",
      port: 3210,
      allowedHostnames: [],
      authBaseUrlMode: "auto",
      authPublicBaseUrl: undefined,
      authDisableSignUp: false,
      databaseMode: "embedded-postgres",
      databaseUrl: undefined,
      embeddedPostgresDataDir: "/tmp/paperclip-test-db",
      embeddedPostgresPort: 54329,
      databaseBackupEnabled: false,
      databaseBackupIntervalMinutes: 60,
      databaseBackupRetentionDays: 30,
      databaseBackupDir: "/tmp/paperclip-test-backups",
      serveUi: false,
      uiDevMiddleware: false,
      secretsProvider: "local_encrypted",
      secretsStrictMode: false,
      secretsMasterKeyFilePath: "/tmp/paperclip-master.key",
      storageProvider: "local_disk",
      storageLocalDiskBaseDir: "/tmp/paperclip-storage",
      storageS3Bucket: "paperclip-test",
      storageS3Region: "us-east-1",
      storageS3Endpoint: undefined,
      storageS3Prefix: "",
      storageS3ForcePathStyle: false,
      feedbackExportBackendUrl: undefined,
      feedbackExportBackendToken: undefined,
      heartbeatSchedulerEnabled: false,
      heartbeatSchedulerIntervalMs: 30000,
      companyDeletionEnabled: false,
      telemetryEnabled: false,
      extensions: {},
    });
    ensurePostgresDatabaseMock
      .mockRejectedValueOnce(Object.assign(new Error("the database system is starting up"), { code: "57P03" }))
      .mockResolvedValueOnce("exists");

    const started = await startServer();

    expect(started.server).toBe(fakeServer);
    expect(embeddedPostgresStartMock).toHaveBeenCalledTimes(1);
    expect(ensurePostgresDatabaseMock).toHaveBeenCalledTimes(2);
    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        attempt: 1,
        maxAttempts: 5,
        label: "ensure embedded PostgreSQL database",
      }),
      "ensure embedded PostgreSQL database hit transient PostgreSQL startup state (57P03); retrying",
    );
  });
});

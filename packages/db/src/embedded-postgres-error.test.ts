import { describe, expect, it } from "vitest";
import { createEmbeddedPostgresLogBuffer, formatEmbeddedPostgresError } from "./embedded-postgres-error.js";

describe("formatEmbeddedPostgresError", () => {
  it("adds a shared-memory hint when initdb logs expose the real cause", () => {
    const error = formatEmbeddedPostgresError("Postgres init script exited with code 1.", {
      fallbackMessage: "Failed to initialize embedded PostgreSQL cluster",
      recentLogs: [
        "running bootstrap script ...",
        "FATAL:  could not create shared memory segment: Cannot allocate memory",
        "DETAIL:  Failed system call was shmget(key=123, size=56, 03600).",
      ],
    });

    expect(error.message).toContain("could not allocate shared memory");
    expect(error.message).toContain("kern.sysv.shm");
    expect(error.message).toContain("could not create shared memory segment");
  });

  it("adds a stale-process hint when postgres reports an in-use shared-memory block", () => {
    const error = formatEmbeddedPostgresError("Postgres exited before startup.", {
      fallbackMessage: "Failed to start embedded PostgreSQL",
      recentLogs: [
        "FATAL:  pre-existing shared memory block is still in use",
        "HINT:  Check if there are any old server processes still running, and terminate them.",
      ],
    });

    expect(error.message).toContain("shared-memory block");
    expect(error.message).toContain("previous local Paperclip Postgres process");
    expect(error.message).toContain("Stop the leftover postgres process tree");
  });

  it("keeps only recent non-empty log lines in the collector", () => {
    const buffer = createEmbeddedPostgresLogBuffer(2);
    buffer.append("line one\n\n");
    buffer.append("line two");
    buffer.append("line three");

    expect(buffer.getRecentLogs()).toEqual(["line two", "line three"]);
  });
});

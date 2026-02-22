const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

describe('Proactive Job System Workflow Validation', () => {
  describe('Test Task Validation', () => {
    it('should verify the test task from p2-1-a exists and is properly formatted', async () => {
      const testTaskPath = path.join(__dirname, '../docs/examples/test-task-documentation-validation.md');
      expect(fs.existsSync(testTaskPath)).toBe(true);

      const testTaskContent = fs.readFileSync(testTaskPath, 'utf8');
      expect(testTaskContent).toContain('## TASK: TEST-DOC-VAL-001 - Create Documentation Validation System');
      expect(testTaskContent).toContain('**Project:** Documentation Quality Initiative');
      expect(testTaskContent).toContain('**Phase:** Phase 1 - Core Validation Framework');
      expect(testTaskContent).toContain('**Min Model:** Sonnet');
      expect(testTaskContent).toContain('**Description:**');
      expect(testTaskContent).toContain('**Files to Create/Modify:**');
      expect(testTaskContent).toContain('**Specific Changes Needed:**');
    });
  });

  describe('Worker Spawning Validation', () => {
    it('should validate the worker spawning process follows the new enhanced template', async () => {
      // Spawn a worker for the test task
      const workerSpawnResult = await spawnWorkerForTestTask();

      // Verify the worker spawning process follows the new template
      expect(workerSpawnResult.stdout).toContain('Worker spawned successfully');
      expect(workerSpawnResult.stderr).not.toContain('Error');

      // Check that the worker's progress file is properly formatted
      const workerProgressPath = path.join(__dirname, '../scheduler/progress/proactive-job-system-enhancement/test-doc-val-001.md');
      expect(fs.existsSync(workerProgressPath)).toBe(true);

      const workerProgressContent = fs.readFileSync(workerProgressPath, 'utf8');
      expect(workerProgressContent).toContain('## Task: test-doc-val-001');
      expect(workerProgressContent).toContain('## Testing Status (MANDATORY)');
      expect(workerProgressContent).toContain('## Work Log');
      expect(workerProgressContent).toContain('## Files Changed');
      expect(workerProgressContent).toContain('## Testing Approach');
      expect(workerProgressContent).toContain('## What I Tried');
      expect(workerProgressContent).toContain('## Open Questions / Blockers');
      expect(workerProgressContent).toContain('## Recommendations for Next Agent');
    });

    it('should validate the worker properly follows the completion checklist', async () => {
      // Simulate the worker completing the task
      const workerCompletionResult = await simulateWorkerCompletion();

      // Verify the worker followed the completion checklist
      expect(workerCompletionResult.stdout).toContain('Task completed successfully');
      expect(workerCompletionResult.stderr).not.toContain('Error');

      // Check that the worker updated the PROACTIVE-JOBS.md file correctly
      const proactiveJobsPath = path.join(__dirname, '../PROACTIVE-JOBS.md');
      expect(fs.existsSync(proactiveJobsPath)).toBe(true);

      const proactiveJobsContent = fs.readFileSync(proactiveJobsPath, 'utf8');
      expect(proactiveJobsContent).toContain('Status: completed');
      expect(proactiveJobsContent).toContain('Completed: YYYY-MM-DD HH:MM EST');
      expect(proactiveJobsContent).toContain('Sub-Tasks:');
      expect(proactiveJobsContent).toContain('✅ test-doc-val-001');
    });
  });
});

async function spawnWorkerForTestTask() {
  return new Promise((resolve, reject) => {
    exec('clawd --model haiku -p "Spawn worker for test task test-doc-val-001"', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function simulateWorkerCompletion() {
  return new Promise((resolve, reject) => {
    exec('clawd --model haiku -p "Complete test task test-doc-val-001"', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
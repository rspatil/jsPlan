const Task = require('./Task');

class Scheduler {
  constructor() {
    this.tasks = new Map();
  }

  addTask(id, duration, dependencies = []) {
    const task = new Task(id, duration, dependencies);
    this.tasks.set(id, task);
    return task;
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  calculateSchedule() {
    if (this.tasks.size === 0) return;
    this.detectCircularDependencies();
    this.forwardPass();
    this.backwardPass();
  }

  detectCircularDependencies() {
    const visited = new Set();
    const stack = new Set();

    const check = (id) => {
      if (stack.has(id)) throw new Error(`Circular dependency detected involving task: ${id}`);
      if (!visited.has(id)) {
        visited.add(id);
        stack.add(id);
        const task = this.getTask(id);
        if (!task) throw new Error(`Task with id: ${id} not found.`);
        for (const depId of task.dependencies) {
          check(depId);
        }
        stack.delete(id);
      }
    };

    for (const id of this.tasks.keys()) {
      check(id);
    }
  }

  forwardPass() {
    const processed = new Set();
    const ids = Array.from(this.tasks.keys());

    while (processed.size < this.tasks.size) {
      let progress = false;
      for (const id of ids) {
        if (processed.has(id)) continue;

        const task = this.getTask(id);
        const depsReady = task.dependencies.every(depId => processed.has(depId));

        if (depsReady) {
          if (task.dependencies.length === 0) {
            task.earlyStart = 0;
          } else {
            task.earlyStart = Math.max(...task.dependencies.map(depId => this.getTask(depId).earlyFinish));
          }
          task.earlyFinish = task.earlyStart + task.duration;
          processed.add(id);
          progress = true;
        }
      }
      if (!progress) break;
    }
  }

  backwardPass() {
    const maxFinish = Math.max(...Array.from(this.tasks.values()).map(t => t.earlyFinish));
    const processed = new Set();
    const ids = Array.from(this.tasks.keys());

    // Map of task ID to tasks that depend on it
    const dependants = new Map();
    for (const [id, task] of this.tasks) {
      for (const depId of task.dependencies) {
        if (!dependants.has(depId)) dependants.set(depId, []);
        dependants.get(depId).push(id);
      }
    }

    while (processed.size < this.tasks.size) {
      let progress = false;
      for (const id of ids) {
        if (processed.has(id)) continue;

        const task = this.getTask(id);
        const nextTasks = dependants.get(id) || [];
        const nextReady = nextTasks.every(nextId => processed.has(nextId));

        if (nextReady) {
          if (nextTasks.length === 0) {
            task.lateFinish = maxFinish;
          } else {
            task.lateFinish = Math.min(...nextTasks.map(nextId => this.getTask(nextId).lateStart));
          }
          task.lateStart = task.lateFinish - task.duration;
          task.slack = task.lateStart - task.earlyStart;
          processed.add(id);
          progress = true;
        }
      }
      if (!progress) break;
    }
  }

  getCriticalPath() {
    return Array.from(this.tasks.values())
      .filter(task => task.slack === 0)
      .sort((a, b) => a.earlyStart - b.earlyStart)
      .map(task => task.id);
  }
}

module.exports = Scheduler;

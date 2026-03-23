class Task {
  constructor(id, duration, dependencies = []) {
    this.id = id;
    this.duration = duration;
    this.dependencies = dependencies;
    this.earlyStart = 0;
    this.earlyFinish = 0;
    this.lateStart = 0;
    this.lateFinish = 0;
    this.slack = 0;
  }
}

module.exports = Task;

const Scheduler = require('../src/Scheduler');

describe('Scheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  test('should handle a simple sequence of tasks', () => {
    scheduler.addTask('A', 5);
    scheduler.addTask('B', 3, ['A']);
    scheduler.addTask('C', 2, ['B']);

    scheduler.calculateSchedule();

    expect(scheduler.getTask('A').earlyStart).toBe(0);
    expect(scheduler.getTask('A').earlyFinish).toBe(5);
    expect(scheduler.getTask('B').earlyStart).toBe(5);
    expect(scheduler.getTask('B').earlyFinish).toBe(8);
    expect(scheduler.getTask('C').earlyStart).toBe(8);
    expect(scheduler.getTask('C').earlyFinish).toBe(10);
  });

  test('should handle parallel tasks', () => {
    scheduler.addTask('A', 5);
    scheduler.addTask('B', 3, ['A']);
    scheduler.addTask('C', 4, ['A']);
    scheduler.addTask('D', 2, ['B', 'C']);

    scheduler.calculateSchedule();

    expect(scheduler.getTask('B').earlyStart).toBe(5);
    expect(scheduler.getTask('C').earlyStart).toBe(5);
    expect(scheduler.getTask('D').earlyStart).toBe(9); // Max(5+3, 5+4)
  });

  test('should calculate critical path correctly', () => {
    scheduler.addTask('A', 5);
    scheduler.addTask('B', 3, ['A']);
    scheduler.addTask('C', 6, ['A']);
    scheduler.addTask('D', 2, ['B', 'C']);

    scheduler.calculateSchedule();
    const criticalPath = scheduler.getCriticalPath();

    expect(criticalPath).toEqual(['A', 'C', 'D']);
    expect(scheduler.getTask('B').slack).toBe(3);
    expect(scheduler.getTask('C').slack).toBe(0);
  });

  test('should throw error for circular dependencies', () => {
    scheduler.addTask('A', 5, ['C']);
    scheduler.addTask('B', 3, ['A']);
    scheduler.addTask('C', 2, ['B']);

    expect(() => scheduler.calculateSchedule()).toThrow('Circular dependency detected');
  });

  test('should throw error for missing dependencies', () => {
    scheduler.addTask('A', 5, ['B']);
    expect(() => scheduler.calculateSchedule()).toThrow('Task with id: B not found.');
  });
});

# jsPlan - Project Scheduling Library

A simple JavaScript library for project scheduling using the Critical Path Method (CPM).

## Installation

```bash
npm install
```

## Usage

```javascript
const Scheduler = require('./src/Scheduler');

const scheduler = new Scheduler();

// Add tasks with id, duration, and dependencies
scheduler.addTask('A', 5);
scheduler.addTask('B', 3, ['A']);
scheduler.addTask('C', 6, ['A']);
scheduler.addTask('D', 2, ['B', 'C']);

// Calculate the schedule
scheduler.calculateSchedule();

// Get individual task details
const taskD = scheduler.getTask('D');
console.log(`Task D Early Start: ${taskD.earlyStart}, Early Finish: ${taskD.earlyFinish}`);

// Get the critical path
const criticalPath = scheduler.getCriticalPath();
console.log(`Critical Path: ${criticalPath.join(' -> ')}`);
```

## Running Tests

```bash
npm test
```

## License

ISC

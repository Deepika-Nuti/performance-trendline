const XLSX = require('xlsx');
const { registry } = require('./src/services/evaluation/registry.ts'); // Wait, require won't work for TS unless I use ts-node or vitest.

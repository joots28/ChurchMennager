import { initialData } from '../data/demoData.js';

const STORAGE_KEY = 'churchmanager-demo-data';

export function loadDemoData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialData, ...JSON.parse(saved) } : structuredClone(initialData);
  } catch {
    return structuredClone(initialData);
  }
}

export function saveDemoData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

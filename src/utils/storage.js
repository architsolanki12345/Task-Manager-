export const STORAGE_KEY = 'tm_tasks_v1'
export const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')
export const save = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d))

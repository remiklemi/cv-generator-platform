export interface ExportFormat {
  todos: any[];
  exportedAt: string;
  version: string;
}

export const exportToJSON = (todos: any[], filename = 'taskflow-export.json') => {
  const data: ExportFormat = {
    todos,
    exportedAt: new Date().toISOString(),
    version: '2.0',
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (todos: any[], filename = 'taskflow-export.csv') => {
  const headers = ['ID', 'Task', 'Status', 'Priority', 'Due Date', 'Created At'];
  const rows = todos.map((todo) => [
    todo.id,
    `"${todo.text.replace(/"/g, '""')}"`,
    todo.completed ? 'Done' : 'Active',
    todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1),
    todo.dueDate || '',
    new Date(todo.createdAt).toISOString(),
  ]);
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(Array.isArray(data.todos) ? data.todos : []);
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });

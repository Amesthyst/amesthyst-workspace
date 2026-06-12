export function calculateProgress(tasks: any[]) {
    if (!tasks?.length) return 0;
  
    const done = tasks.filter((t) => t.status === "DONE").length;
  
    return Math.round((done / tasks.length) * 100);
  }
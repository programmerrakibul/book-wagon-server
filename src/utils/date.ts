export const daysAgo = (n: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const startOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

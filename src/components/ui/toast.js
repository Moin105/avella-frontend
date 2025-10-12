// Mock toast implementation - replace with actual toast library
export const Toaster = () => null;
export const toast = (options) => {
  if (options.variant === 'destructive') {
    console.error(`${options.title}: ${options.description}`);
  } else {
    console.log(`${options.title}: ${options.description}`);
  }
};
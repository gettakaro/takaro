export const setAriaDescribedBy = (name: string, hasDescription: boolean) => {
  return hasDescription ? `${name}-description` : undefined;
};

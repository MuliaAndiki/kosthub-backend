export const createSlug = (name) => {
  const random = Math.floor(Math.random() * 1000);
  return name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + random;
};

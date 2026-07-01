export const getBrowserId = () => {
  const key = "cookoff_browser_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

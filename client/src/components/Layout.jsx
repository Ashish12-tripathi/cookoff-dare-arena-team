function Layout({ children }) {
  return (
    <main className="app-shell">
      <div className="app-container">{children}</div>
    </main>
  );
}
export default Layout;

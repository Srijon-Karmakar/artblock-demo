import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <div className="status-screen">
    <div className="status-screen__card">
      <h1>Page not found</h1>
      <p>The page you requested does not exist in the current app shell.</p>
      <Link className="solid-button" to="/">
        Back Home
      </Link>
    </div>
  </div>
);

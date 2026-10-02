import { Navigate, useParams, useSearchParams } from "react-router-dom";

/** OAuth still lands on /businesses/:id — Search Console goes to Performance, Analytics goes to Connections. */
export function BusinessIndexRedirect() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";
  const section = searchParams.has("scConnected") || searchParams.has("scError") ? "performance" : searchParams.has("gaConnected") || searchParams.has("gaError") ? "connections" : "overview";
  return <Navigate to={`/businesses/${id}/${section}${suffix}`} replace />;
}

import { Navigate, useParams, useSearchParams } from "react-router-dom";

/** OAuth still lands on /businesses/:id — send GSC callbacks to Performance, everything else to Overview. */
export function BusinessIndexRedirect() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  const suffix = query ? `?${query}` : "";
  const section = searchParams.has("scConnected") || searchParams.has("scError") ? "performance" : "overview";
  return <Navigate to={`/businesses/${id}/${section}${suffix}`} replace />;
}

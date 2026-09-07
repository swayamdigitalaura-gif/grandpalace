import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/leads/")({
  component: LeadsIndexRedirect,
});

// Bare /admin/leads has no type to show — bounce to the first tab.
// (Sidebar links always go straight to /admin/leads/$type; this only
// matters for a bookmarked or manually-typed /admin/leads URL.)
function LeadsIndexRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/admin/leads/$type", params: { type: "contact" }, replace: true });
  }, [navigate]);
  return null;
}

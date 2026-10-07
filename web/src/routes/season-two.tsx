import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/season-two")({
  component: () => <Outlet />,
});

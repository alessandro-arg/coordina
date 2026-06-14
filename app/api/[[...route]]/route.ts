import { Hono } from "hono";
import { handle } from "hono/vercel";

import account from "../../features/auth/server/account-route";
import current from "../../features/auth/server/current-route";
import members from "../../features/members/server/members-route";
import projects from "../../features/projects/server/projects-route";
import tasks from "../../features/tasks/server/tasks-route";
import workspaces from "../../features/workspaces/server/workspaces-route";

const app = new Hono().basePath("/api");

const routes = app
  .route("/current", current)
  .route("/account", account)
  .route("/workspaces", workspaces)
  .route("/members", members)
  .route("/projects", projects)
  .route("/tasks", tasks);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

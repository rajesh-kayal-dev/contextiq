const { Workspace } = require("../../models/workspace");
const { WorkspaceThread } = require("../../models/workspaceThread");
const { userFromSession } = require("../http");

// Will pre-validate and set the workspace for a request if the slug is provided in the URL path.
// Strictly checks workspace ownership for the authenticated user.
async function validWorkspaceSlug(request, response, next) {
  const { slug } = request.params;
  const user = await userFromSession(request, response);
  const workspace = user
    ? await Workspace.getWithUser(user, { slug })
    : await Workspace.get({ slug });

  if (!workspace) {
    response.status(404).send("Workspace does not exist.");
    return;
  }

  response.locals.workspace = workspace;
  next();
}

// Will pre-validate and set the workspace AND a thread for a request if the slugs are provided in the URL path.
// Strictly checks workspace and thread ownership for the authenticated user.
async function validWorkspaceAndThreadSlug(request, response, next) {
  const { slug, threadSlug } = request.params;
  const user = await userFromSession(request, response);
  const workspace = user
    ? await Workspace.getWithUser(user, { slug })
    : await Workspace.get({ slug });

  if (!workspace) {
    response.status(404).send("Workspace does not exist.");
    return;
  }

  const thread = await WorkspaceThread.get({
    slug: threadSlug,
    user_id: user?.id || null,
    workspace_id: workspace.id,
  });
  if (!thread) {
    response.status(404).send("Workspace thread does not exist.");
    return;
  }

  response.locals.workspace = workspace;
  response.locals.thread = thread;
  next();
}

module.exports = {
  validWorkspaceSlug,
  validWorkspaceAndThreadSlug,
};

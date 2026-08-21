const { validatedRequest } = require("../utils/middleware/validatedRequest");
const {
  flexUserRoleValid,
  ROLES,
} = require("../utils/middleware/multiUserProtected");

function communityHubEndpoints(app) {
  if (!app) return;

  // Settings endpoint - stubbed
  app.get(
    "/community-hub/settings",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );

  app.post(
    "/community-hub/settings",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );

  // Explore endpoint - return clean empty list to avoid breaking frontend UI
  app.get(
    "/community-hub/explore",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      try {
        response.status(200).json({
          success: true,
          result: {
            agentSkills: { items: [], hasMore: false, totalCount: 0 },
            systemPrompts: { items: [], hasMore: false, totalCount: 0 },
            slashCommands: { items: [], hasMore: false, totalCount: 0 },
          },
        });
      } catch (error) {
        console.error(error);
        response
          .status(500)
          .json({ success: false, result: null, error: error.message });
      }
    }
  );

  app.post(
    "/community-hub/item",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );

  app.post(
    "/community-hub/apply",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );

  app.post(
    "/community-hub/import",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );

  // Items endpoint - return clean empty lists to avoid breaking frontend UI
  app.get(
    "/community-hub/items",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response
        .status(200)
        .json({ success: true, createdByMe: {}, teamItems: [] });
    }
  );

  app.post(
    "/community-hub/:communityHubItemType/create",
    [validatedRequest, flexUserRoleValid([ROLES.admin])],
    async (_, response) => {
      response.status(400).json({
        success: false,
        error: "Community Hub is not supported in ContextIQ.",
      });
    }
  );
}

module.exports = { communityHubEndpoints };

import {
  createAttachmentController,
  deleteAttachmentController,
  getAttachmentsByMaintenanceController,
} from "./maintenanceAttachments.controller";

import {
  createAttachmentBodySchema,
  createAttachmentParamsSchema,
  attachmentParamsSchema,
  attachmentsByMaintenanceParamsSchema,
} from "./maintenanceAttachments.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function maintenanceAttachmentsRoutes(app: FastifyInstance) {
  app.get(
    "/maintenance/:maintenanceId/attachments",
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: attachmentsByMaintenanceParamsSchema,
      });

      return getAttachmentsByMaintenanceController(
        { ...request, params } as any,
        reply
      );
    }
  );

  app.post(
    "/maintenance/:maintenanceId/attachments",
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const { params, body } = await validateRequest(request, {
        params: createAttachmentParamsSchema,
        body: createAttachmentBodySchema,
      });

      return createAttachmentController(
        { ...request, params, body } as any,
        reply
      );
    }
  );

  app.delete(
    "/maintenance/attachments/:id",
    {
      preHandler: [authMiddleware, adminOnly],
    },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: attachmentParamsSchema,
      });

      return deleteAttachmentController(
        { ...request, params } as any,
        reply
      );
    }
  );
}
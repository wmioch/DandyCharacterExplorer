import crypto from 'node:crypto';

import { TableClient } from '@azure/data-tables';
import { app } from '@azure/functions';

const DEFAULT_TABLE_NAME = 'DandyFeedback';
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;
const ALLOWED_PLATFORMS = new Set([
  'web',
  'windows',
  'android',
  'ios',
  'macos',
  'linux',
  'fuchsia'
]);

let cachedTableClient;
let ensuredTablePromise;

function getConfig() {
  return {
    storageConnectionString: process.env.AzureWebJobsStorage?.trim() || '',
    tableName: process.env.FEEDBACK_TABLE_NAME?.trim() || DEFAULT_TABLE_NAME,
    adminToken: process.env.FEEDBACK_ADMIN_TOKEN?.trim() || ''
  };
}

function getTableClient() {
  if (cachedTableClient) {
    return cachedTableClient;
  }

  const config = getConfig();

  if (!config.storageConnectionString) {
    throw new Error('AzureWebJobsStorage is not configured.');
  }

  cachedTableClient = TableClient.fromConnectionString(
    config.storageConnectionString,
    config.tableName
  );

  return cachedTableClient;
}

async function ensureTableExists() {
  if (!ensuredTablePromise) {
    ensuredTablePromise = getTableClient()
      .createTable()
      .catch((error) => {
        if (error.statusCode === 409) {
          return undefined;
        }

        ensuredTablePromise = undefined;
        throw error;
      });
  }

  await ensuredTablePromise;
}

function buildCursor(receivedAt) {
  const timestamp = receivedAt
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.(\d{3})Z$/, '$1Z');
  const suffix = crypto.randomBytes(3).toString('hex');

  return `${timestamp}_${suffix}`;
}

function parseLimit(rawLimit) {
  const parsed = Number.parseInt(rawLimit ?? '', 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(parsed, MAX_LIMIT);
}

function escapeODataString(value) {
  return value.replace(/'/g, "''");
}

function normalizePayload(payload) {
  return {
    submitted_at: payload.submitted_at,
    feedback: {
      message: payload.feedback.message.trim()
    },
    app: {
      name: payload.app.name.trim(),
      version: payload.app.version.trim(),
      platform: payload.app.platform.trim()
    },
    ecg_case: payload.ecg_case ?? null
  };
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Request body must be a JSON object.';
  }

  if (!payload.feedback || typeof payload.feedback !== 'object') {
    return 'feedback is required.';
  }

  if (typeof payload.feedback.message !== 'string' || payload.feedback.message.trim().length === 0) {
    return 'feedback.message is required.';
  }

  const submittedAt = new Date(payload.submitted_at);
  if (Number.isNaN(submittedAt.getTime())) {
    return 'submitted_at must be a valid ISO 8601 timestamp.';
  }

  if (!payload.app || typeof payload.app !== 'object') {
    return 'app is required.';
  }

  const appName = typeof payload.app.name === 'string' ? payload.app.name.trim() : '';
  const appVersion = typeof payload.app.version === 'string' ? payload.app.version.trim() : '';
  const appPlatform = typeof payload.app.platform === 'string' ? payload.app.platform.trim() : '';

  if (!appName || !appVersion || !appPlatform) {
    return 'app.name, app.version, and app.platform are required.';
  }

  if (!ALLOWED_PLATFORMS.has(appPlatform)) {
    return 'app.platform is invalid.';
  }

  return null;
}

async function parseRequestJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function buildFeedbackItem(entity) {
  let payload;

  try {
    payload = JSON.parse(entity.payloadJson);
  } catch {
    payload = {
      submitted_at: entity.submittedAt,
      feedback: { message: entity.message },
      app: {
        name: entity.appName,
        version: entity.appVersion,
        platform: entity.platform
      },
      ecg_case: null
    };
  }

  const normalizedPayload = normalizePayload(payload);

  return {
    id: entity.rowKey,
    received_at: entity.receivedAt,
    submitted_at: normalizedPayload.submitted_at,
    feedback: normalizedPayload.feedback,
    app: normalizedPayload.app,
    ecg_case: normalizedPayload.ecg_case
  };
}

app.http('feedback-submit', {
  route: 'feedback',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const payload = await parseRequestJson(request);
    const validationError = validatePayload(payload);

    if (validationError) {
      return {
        status: 400,
        jsonBody: {
          error: validationError
        }
      };
    }

    const normalizedPayload = normalizePayload(payload);
    const receivedAt = new Date();
    const rowKey = buildCursor(receivedAt);
    const entity = {
      partitionKey: 'feedback',
      rowKey,
      receivedAt: receivedAt.toISOString(),
      submittedAt: normalizedPayload.submitted_at,
      message: normalizedPayload.feedback.message,
      appName: normalizedPayload.app.name,
      appVersion: normalizedPayload.app.version,
      platform: normalizedPayload.app.platform,
      payloadJson: JSON.stringify(normalizedPayload)
    };

    try {
      await ensureTableExists();
      await getTableClient().createEntity(entity);
    } catch (error) {
      context.error('Failed to store feedback entity.', error);
      return {
        status: 500,
        jsonBody: {
          error: 'Failed to persist feedback.'
        }
      };
    }

    return {
      status: 202,
      jsonBody: {
        accepted: true,
        id: rowKey
      }
    };
  }
});

app.http('feedback-list', {
  route: 'feedback',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const config = getConfig();
    const adminToken = request.query.get('admin_token')?.trim() || '';

    if (!config.adminToken || adminToken !== config.adminToken) {
      return {
        status: 401,
        jsonBody: {
          error: 'Unauthorized.'
        }
      };
    }

    const after = request.query.get('after')?.trim() || '';
    const limit = parseLimit(request.query.get('limit'));
    const escapedAfter = escapeODataString(after);
    const filter = after
      ? `PartitionKey eq 'feedback' and RowKey gt '${escapedAfter}'`
      : `PartitionKey eq 'feedback'`;

    const items = [];

    try {
      await ensureTableExists();

      const entities = getTableClient().listEntities({
        queryOptions: {
          filter
        }
      });

      for await (const entity of entities) {
        items.push(buildFeedbackItem(entity));

        if (items.length >= limit) {
          break;
        }
      }
    } catch (error) {
      context.error('Failed to query feedback entities.', error);
      return {
        status: 500,
        jsonBody: {
          error: 'Failed to query feedback.'
        }
      };
    }

    return {
      status: 200,
      jsonBody: {
        items,
        next_cursor: items.length > 0 ? items[items.length - 1].id : null
      }
    };
  }
});

app.http('feedback-healthz', {
  route: 'healthz',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => ({
    status: 200,
    jsonBody: {
      ok: true
    }
  })
});

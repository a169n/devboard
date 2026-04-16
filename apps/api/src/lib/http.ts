import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function fail(
  res: Response,
  status: number,
  message: string,
  details?: unknown,
  code?: string,
) {
  return res
    .status(status)
    .json({ success: false, error: { ...(code !== undefined && { code }), message, ...(details !== undefined && { details }) } });
}

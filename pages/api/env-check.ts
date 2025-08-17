// pages/api/env-check.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasUrl = !!process.env.SUPABASE_URL
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  res.status(200).json({
    hasUrl,
    hasServiceRole,
  })
}

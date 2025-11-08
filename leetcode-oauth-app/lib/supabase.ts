import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

/**
 * Supabase Client Configuration
 * Cloud-based PostgreSQL database via Supabase
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error({ type: 'config' }, 'Missing Supabase configuration')
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client-side Supabase client
 * Uses anon key for browser operations
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Server-side Supabase client
 * Uses service role key for admin operations
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Database connection string for Prisma
 * Extracted from Supabase connection pooler
 */
export const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL

  if (!url) {
    logger.error({ type: 'config' }, 'Missing DATABASE_URL')
    throw new Error('DATABASE_URL environment variable is not set')
  }

  return url
}

/**
 * Health check for Supabase connection
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('User').select('count').limit(1)

    if (error) {
      logger.error({ error: error.message }, 'Supabase health check failed')
      return false
    }

    logger.info({ type: 'health_check' }, 'Supabase connection healthy')
    return true
  } catch (error) {
    logger.error({ error }, 'Supabase health check exception')
    return false
  }
}

export default supabase

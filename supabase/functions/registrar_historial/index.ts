import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface HistoryData {
  user_id: string
  action: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
}

interface RequestBody {
  history: HistoryData
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body: RequestBody = await req.json()

    // Validate required fields
    if (!body.history || !body.history.user_id || !body.history.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: history.user_id and history.action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { history } = body

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', history.user_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get client information from headers
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = forwardedFor?.split(',')[0]?.trim() ||
                    realIp ||
                    req.headers.get('cf-connecting-ip') ||
                    'unknown'

    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Insert history record
    const { data, error } = await supabase
      .from('historial')
      .insert({
        user_id: history.user_id,
        action: history.action,
        details: history.details || {},
        ip_address: history.ip_address || clientIp,
        user_agent: history.user_agent || userAgent,
        metadata: history.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting history record:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to register history' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'History registered successfully',
        history: data
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
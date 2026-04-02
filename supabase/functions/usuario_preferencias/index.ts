import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserPreferences {
  user_id: string
  preferences: Record<string, any>
  theme?: string
  language?: string
  notifications?: boolean
  marketing_emails?: boolean
}

interface RequestBody {
  action: 'get' | 'update'
  user_id: string
  preferences?: Partial<UserPreferences>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (!['GET', 'POST'].includes(req.method)) {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For GET requests, parse query parameters
    let body: RequestBody
    if (req.method === 'GET') {
      const url = new URL(req.url)
      body = {
        action: 'get',
        user_id: url.searchParams.get('user_id') || ''
      }
    } else {
      // For POST requests, parse JSON body
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
      body = await req.json()
    }

    // Validate required fields
    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
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

    const { action, user_id, preferences } = body

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', user_id)
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

    switch (action) {
      case 'get': {
        // Get user preferences
        const { data, error } = await supabase
          .from('usuario_preferencias')
          .select('*')
          .eq('user_id', user_id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error fetching preferences:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch preferences' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            preferences: data || {
              user_id,
              preferences: {},
              theme: 'light',
              language: 'es',
              notifications: true,
              marketing_emails: true
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'update': {
        if (!preferences) {
          return new Response(
            JSON.stringify({ error: 'preferences object is required for update action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Check if preferences already exist
        const { data: existingPrefs } = await supabase
          .from('usuario_preferencias')
          .select('id')
          .eq('user_id', user_id)
          .single()

        const updateData = {
          user_id,
          preferences: preferences.preferences || {},
          theme: preferences.theme,
          language: preferences.language,
          notifications: preferences.notifications,
          marketing_emails: preferences.marketing_emails,
          updated_at: new Date().toISOString()
        }

        let result
        if (existingPrefs) {
          // Update existing preferences
          const { data, error } = await supabase
            .from('usuario_preferencias')
            .update(updateData)
            .eq('user_id', user_id)
            .select()
            .single()

          if (error) {
            console.error('Error updating preferences:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to update preferences' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
          result = data
        } else {
          // Create new preferences
          const { data, error } = await supabase
            .from('usuario_preferencias')
            .insert({
              ...updateData,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            console.error('Error creating preferences:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to create preferences' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            )
          }
          result = data
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Preferences updated successfully',
            preferences: result
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be get or update' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

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
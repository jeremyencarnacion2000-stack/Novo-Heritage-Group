import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserData {
  id?: string
  email: string
  name?: string
  phone?: string
  preferences?: Record<string, any>
  email_3days?: boolean
  email_7days?: boolean
  email_14days?: boolean
}

interface RequestBody {
  action: 'create' | 'update' | 'delete'
  user: UserData
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
    if (!body.action || !body.user) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action and user' }),
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

    const { action, user } = body

    switch (action) {
      case 'create': {
        // Validate required fields for creation
        if (!user.email) {
          return new Response(
            JSON.stringify({ error: 'Email is required for user creation' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .single()

        if (existingUser) {
          return new Response(
            JSON.stringify({ error: 'User with this email already exists' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Create new user
        const { data, error } = await supabase
          .from('usuarios')
          .insert({
            email: user.email,
            name: user.name || null,
            phone: user.phone || null,
            preferences: user.preferences || {},
            email_3days: user.email_3days ?? true,
            email_7days: user.email_7days ?? true,
            email_14days: user.email_14days ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating user:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to create user' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User created successfully',
            user: data
          }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'update': {
        // Validate required fields for update
        if (!user.id && !user.email) {
          return new Response(
            JSON.stringify({ error: 'User ID or email is required for update' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Build update object
        const updateData: Partial<UserData> = {
          updated_at: new Date().toISOString()
        }

        if (user.name !== undefined) updateData.name = user.name
        if (user.phone !== undefined) updateData.phone = user.phone
        if (user.preferences !== undefined) updateData.preferences = user.preferences
        if (user.email_3days !== undefined) updateData.email_3days = user.email_3days
        if (user.email_7days !== undefined) updateData.email_7days = user.email_7days
        if (user.email_14days !== undefined) updateData.email_14days = user.email_14days

        // Update user
        let query = supabase.from('usuarios').update(updateData)

        if (user.id) {
          query = query.eq('id', user.id)
        } else {
          query = query.eq('email', user.email)
        }

        const { data, error } = await query.select().single()

        if (error) {
          console.error('Error updating user:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to update user' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User updated successfully',
            user: data
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      case 'delete': {
        // Validate required fields for deletion
        if (!user.id && !user.email) {
          return new Response(
            JSON.stringify({ error: 'User ID or email is required for deletion' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        // Delete user
        let query = supabase.from('usuarios').delete()

        if (user.id) {
          query = query.eq('id', user.id)
        } else {
          query = query.eq('email', user.email)
        }

        const { error } = await query

        if (error) {
          console.error('Error deleting user:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to delete user' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'User deleted successfully'
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      default: {
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be create, update, or delete' }),
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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalysisRequest {
  user_id?: string
  date_from?: string
  date_to?: string
  action_filter?: string[]
  limit?: number
  offset?: number
}

interface AnalysisResponse {
  total_records: number
  date_range: {
    from: string
    to: string
  }
  user_analysis?: {
    user_id: string
    total_actions: number
    actions_by_type: Record<string, number>
    last_activity: string
    activity_trend: Array<{
      date: string
      count: number
    }>
  }
  global_analysis?: {
    total_users: number
    total_actions: number
    actions_by_type: Record<string, number>
    daily_activity: Array<{
      date: string
      count: number
    }>
    top_actions: Array<{
      action: string
      count: number
      percentage: number
    }>
    user_engagement: {
      active_users: number
      inactive_users: number
      new_users_today: number
      returning_users: number
    }
  }
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
    const body: AnalysisRequest = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Set date range (default to last 30 days)
    const now = new Date()
    const dateFrom = body.date_from ? new Date(body.date_from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dateTo = body.date_to ? new Date(body.date_to) : now

    const limit = Math.min(body.limit || 1000, 5000) // Max 5000 records
    const offset = body.offset || 0

    let analysis: AnalysisResponse = {
      total_records: 0,
      date_range: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString()
      }
    }

    if (body.user_id) {
      // User-specific analysis
      const { data: userHistory, error: historyError } = await supabase
        .from('historial')
        .select('*')
        .eq('user_id', body.user_id)
        .gte('created_at', dateFrom.toISOString())
        .lte('created_at', dateTo.toISOString())
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (historyError) {
        console.error('Error fetching user history:', historyError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user history' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!userHistory || userHistory.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              ...analysis,
              user_analysis: {
                user_id: body.user_id,
                total_actions: 0,
                actions_by_type: {},
                last_activity: null,
                activity_trend: []
              }
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Analyze user data
      const actionsByType: Record<string, number> = {}
      const activityTrend: Array<{ date: string; count: number }> = []

      userHistory.forEach(record => {
        // Count actions by type
        actionsByType[record.action] = (actionsByType[record.action] || 0) + 1

        // Build activity trend (daily)
        const date = record.created_at.split('T')[0]
        const existingDay = activityTrend.find(day => day.date === date)
        if (existingDay) {
          existingDay.count++
        } else {
          activityTrend.push({ date, count: 1 })
        }
      })

      analysis.total_records = userHistory.length
      analysis.user_analysis = {
        user_id: body.user_id,
        total_actions: userHistory.length,
        actions_by_type: actionsByType,
        last_activity: userHistory[0].created_at,
        activity_trend: activityTrend.sort((a, b) => a.date.localeCompare(b.date))
      }

    } else {
      // Global analysis
      let query = supabase
        .from('historial')
        .select(`
          *,
          usuarios!inner(id, email, name)
        `)
        .gte('created_at', dateFrom.toISOString())
        .lte('created_at', dateTo.toISOString())

      // Apply action filter if provided
      if (body.action_filter && body.action_filter.length > 0) {
        query = query.in('action', body.action_filter)
      }

      const { data: globalHistory, error: globalError } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (globalError) {
        console.error('Error fetching global history:', globalError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch global history' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (!globalHistory || globalHistory.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            analysis: {
              ...analysis,
              global_analysis: {
                total_users: 0,
                total_actions: 0,
                actions_by_type: {},
                daily_activity: [],
                top_actions: [],
                user_engagement: {
                  active_users: 0,
                  inactive_users: 0,
                  new_users_today: 0,
                  returning_users: 0
                }
              }
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // Analyze global data
      const actionsByType: Record<string, number> = {}
      const dailyActivity: Array<{ date: string; count: number }> = []
      const uniqueUsers = new Set<string>()
      const today = new Date().toISOString().split('T')[0]
      const newUsersToday = new Set<string>()

      globalHistory.forEach(record => {
        // Count actions by type
        actionsByType[record.action] = (actionsByType[record.action] || 0) + 1

        // Track unique users
        uniqueUsers.add(record.user_id)

        // Build daily activity
        const date = record.created_at.split('T')[0]
        const existingDay = dailyActivity.find(day => day.date === date)
        if (existingDay) {
          existingDay.count++
        } else {
          dailyActivity.push({ date, count: 1 })
        }

        // Check for new users today
        if (date === today && record.action === 'user_created') {
          newUsersToday.add(record.user_id)
        }
      })

      // Calculate top actions
      const topActions = Object.entries(actionsByType)
        .map(([action, count]) => ({
          action,
          count,
          percentage: (count / globalHistory.length) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // Get user engagement data
      const { data: allUsers } = await supabase
        .from('usuarios')
        .select('id, last_activity')

      const activeUsers = allUsers?.filter(user =>
        user.last_activity &&
        new Date(user.last_activity) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0

      analysis.total_records = globalHistory.length
      analysis.global_analysis = {
        total_users: uniqueUsers.size,
        total_actions: globalHistory.length,
        actions_by_type: actionsByType,
        daily_activity: dailyActivity.sort((a, b) => a.date.localeCompare(b.date)),
        top_actions: topActions,
        user_engagement: {
          active_users: activeUsers,
          inactive_users: (allUsers?.length || 0) - activeUsers,
          new_users_today: newUsersToday.size,
          returning_users: uniqueUsers.size - newUsersToday.size
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      {
        status: 200,
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
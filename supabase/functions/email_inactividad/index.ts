import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface InactiveUser {
  id: string
  email: string
  name: string | null
  last_activity: string
  days_inactive: number
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

    // Parse request body (optional - can be empty for automatic execution)
    const body = await req.json().catch(() => ({}))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get current date
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Find inactive users
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('usuarios')
      .select('id, email, name, email_3days, email_7days, email_14days')
      .not('last_activity', 'is', null)
      .or(`and(email_3days.eq.true,last_activity.lt.${threeDaysAgo.toISOString()}),and(email_7days.eq.true,last_activity.lt.${sevenDaysAgo.toISOString()}),and(email_14days.eq.true,last_activity.lt.${fourteenDaysAgo.toISOString()})`)

    if (usersError) {
      console.error('Error fetching inactive users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch inactive users' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No inactive users found',
          emails_sent: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get last activity for each user from historial table
    const userIds = inactiveUsers.map(user => user.id)
    const { data: lastActivities, error: activityError } = await supabase
      .from('historial')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false })

    if (activityError) {
      console.error('Error fetching user activities:', activityError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user activities' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Group activities by user and calculate days inactive
    const userLastActivity = new Map<string, string>()
    lastActivities?.forEach(activity => {
      if (!userLastActivity.has(activity.user_id)) {
        userLastActivity.set(activity.user_id, activity.created_at)
      }
    })

    // Filter users based on their flags and actual inactivity
    const usersToEmail: InactiveUser[] = []
    inactiveUsers.forEach(user => {
      const lastActivity = userLastActivity.get(user.id)
      if (!lastActivity) return

      const daysInactive = Math.floor((now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))

      if (daysInactive >= 3 && daysInactive < 7 && user.email_3days) {
        usersToEmail.push({
          id: user.id,
          email: user.email,
          name: user.name,
          last_activity: lastActivity,
          days_inactive: daysInactive
        })
      } else if (daysInactive >= 7 && daysInactive < 14 && user.email_7days) {
        usersToEmail.push({
          id: user.id,
          email: user.email,
          name: user.name,
          last_activity: lastActivity,
          days_inactive: daysInactive
        })
      } else if (daysInactive >= 14 && user.email_14days) {
        usersToEmail.push({
          id: user.id,
          email: user.email,
          name: user.name,
          last_activity: lastActivity,
          days_inactive: daysInactive
        })
      }
    })

    // Send emails
    let emailsSent = 0
    const emailPromises = usersToEmail.map(async (user) => {
      try {
        const emailTemplate = getEmailTemplate(user.days_inactive, user.name)

        const emailData = {
          sender: {
            name: "Novo Heritage Group",
            email: "noreply@novohg.com"
          },
          to: [{
            email: user.email,
            name: user.name || "Usuario"
          }],
          subject: emailTemplate.subject,
          htmlContent: emailTemplate.html,
          textContent: emailTemplate.text
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        if (response.ok) {
          emailsSent++

          // Log email sent in history
          await supabase
            .from('historial')
            .insert({
              user_id: user.id,
              action: 'email_inactivity_sent',
              details: {
                days_inactive: user.days_inactive,
                email_type: user.days_inactive >= 14 ? '14_days' : user.days_inactive >= 7 ? '7_days' : '3_days'
              },
              metadata: {
                email_sent: true,
                brevo_response: await response.json()
              },
              created_at: new Date().toISOString()
            })
        } else {
          console.error(`Failed to send email to ${user.email}:`, await response.text())
        }
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error)
      }
    })

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Inactivity emails processed successfully`,
        emails_sent: emailsSent,
        users_found: usersToEmail.length
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

function getEmailTemplate(daysInactive: number, userName: string | null): EmailTemplate {
  const name = userName || 'Usuario'
  const days = daysInactive >= 14 ? '14' : daysInactive >= 7 ? '7' : '3'

  const templates = {
    3: {
      subject: '¡Te hemos extrañado! 👋',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e78a53;">¡Hola ${name}!</h1>
          <p>Hace ${daysInactive} días que no nos visitas. Te hemos extrañado mucho.</p>
          <p>¿Quieres volver a explorar nuestros servicios? Tenemos nuevas ofertas que podrían interesarte.</p>
          <a href="https://novohg.com" style="background-color: #e78a53; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Explorar Servicios</a>
          <p style="color: #666; font-size: 12px;">Si no deseas recibir estos correos, puedes <a href="#">desactivarlos aquí</a>.</p>
        </div>
      `,
      text: `¡Hola ${name}! Hace ${daysInactive} días que no nos visitas. Te hemos extrañado mucho. ¿Quieres volver a explorar nuestros servicios? Visita: https://novohg.com`
    },
    7: {
      subject: '¡Tu cuenta te está esperando! ⏰',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e78a53;">¡Hola ${name}!</h1>
          <p>Hace ${daysInactive} días que no interactúas con nosotros. Tu cuenta está lista para nuevas aventuras.</p>
          <p>Descubre las últimas actualizaciones y ofertas especiales que hemos preparado para ti.</p>
          <a href="https://novohg.com" style="background-color: #e78a53; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Ver Ofertas</a>
          <p style="color: #666; font-size: 12px;">Si no deseas recibir estos correos, puedes <a href="#">desactivarlos aquí</a>.</p>
        </div>
      `,
      text: `¡Hola ${name}! Hace ${daysInactive} días que no interactúas con nosotros. Tu cuenta está lista para nuevas aventuras. Descubre las últimas ofertas: https://novohg.com`
    },
    14: {
      subject: '¡Es hora de reconectar! 🌟',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e78a53;">¡Hola ${name}!</h1>
          <p>Hace ${daysInactive} días que no nos visitas. Es mucho tiempo sin disfrutar de nuestros servicios.</p>
          <p>Tenemos ofertas exclusivas esperando por ti. ¡No esperes más para reconectar!</p>
          <a href="https://novohg.com" style="background-color: #e78a53; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reconectar Ahora</a>
          <p style="color: #666; font-size: 12px;">Si no deseas recibir estos correos, puedes <a href="#">desactivarlos aquí</a>.</p>
        </div>
      `,
      text: `¡Hola ${name}! Hace ${daysInactive} días que no nos visitas. Es mucho tiempo sin disfrutar de nuestros servicios. Tenemos ofertas exclusivas esperando: https://novohg.com`
    }
  }

  return templates[days as keyof typeof templates] || templates[3]
}
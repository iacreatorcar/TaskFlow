import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record, table, type } = await req.json();

    // Gestisci diverse tabelle e operazioni
    switch (table) {
      case 'tickets': {
        if (type === 'INSERT') {
          // Notifica assegnatario
          if (record.assignee_id) {
            await notifyUser(supabaseClient, record.assignee_id, 'ticket_assigned', {
              title: 'Nuovo ticket assegnato',
              message: `Ti è stato assegnato il ticket: ${record.title}`,
              ticket_id: record.id,
            });
          }
        }
        
        if (type === 'UPDATE') {
          const oldRecord = req.json().old_record;
          
          // Notifica cambio stato
          if (oldRecord.status !== record.status) {
            // Notifica reporter
            await notifyUser(supabaseClient, record.reporter_id, 'status_changed', {
              title: 'Stato ticket cambiato',
              message: `Il ticket "${record.title}" è passato a: ${record.status}`,
              ticket_id: record.id,
            });
          }
          
          // Notifica nuovo assegnatario
          if (oldRecord.assignee_id !== record.assignee_id && record.assignee_id) {
            await notifyUser(supabaseClient, record.assignee_id, 'ticket_assigned', {
              title: 'Ticket assegnato',
              message: `Ti è stato assegnato il ticket: ${record.title}`,
              ticket_id: record.id,
            });
          }
        }
        break;
      }

      case 'comments': {
        if (type === 'INSERT') {
          // Recupera info ticket
          const { data: ticket } = await supabaseClient
            .from('tickets')
            .select('title, assignee_id, reporter_id')
            .eq('id', record.ticket_id)
            .single();

          if (ticket) {
            // Notifica assegnatario se diverso dall'autore
            if (ticket.assignee_id && ticket.assignee_id !== record.author_id) {
              await notifyUser(supabaseClient, ticket.assignee_id, 'comment_added', {
                title: 'Nuovo commento',
                message: `Nuovo commento sul ticket: ${ticket.title}`,
                ticket_id: record.ticket_id,
              });
            }

            // Notifica reporter se diverso dall'autore e assegnatario
            if (ticket.reporter_id && 
                ticket.reporter_id !== record.author_id && 
                ticket.reporter_id !== ticket.assignee_id) {
              await notifyUser(supabaseClient, ticket.reporter_id, 'comment_added', {
                title: 'Nuovo commento',
                message: `Nuovo commento sul ticket: ${ticket.title}`,
                ticket_id: record.ticket_id,
              });
            }

            // Cerca menzioni nel commento (@username)
            const mentions = record.content.match(/@(\w+)/g);
            if (mentions) {
              for (const mention of mentions) {
                const username = mention.substring(1);
                const { data: mentionedUser } = await supabaseClient
                  .from('profiles')
                  .select('id')
                  .ilike('name', username)
                  .single();

                if (mentionedUser && mentionedUser.id !== record.author_id) {
                  await notifyUser(supabaseClient, mentionedUser.id, 'ticket_mentioned', {
                    title: 'Sei stato menzionato',
                    message: `Sei stato menzionato in un commento su: ${ticket.title}`,
                    ticket_id: record.ticket_id,
                  });
                }
              }
            }
          }
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function notifyUser(
  supabase: any,
  userId: string,
  type: string,
  { title, message, ticket_id }: { title: string; message: string; ticket_id: string }
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    ticket_id,
  });
}

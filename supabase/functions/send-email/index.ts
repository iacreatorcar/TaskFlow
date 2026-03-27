import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface EmailPayload {
  to: string;
  templateName: string;
  data: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, templateName, data }: EmailPayload = await req.json();

    // Recupera il template email
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error(`Template '${templateName}' non trovato`);
    }

    // Sostituisci le variabili nel template
    let htmlContent = template.html_content;
    let textContent = template.text_content || '';
    let subject = template.subject;

    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
      textContent = textContent.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    // Invia l'email usando Resend (o altro provider)
    // Configura RESEND_API_KEY nelle variabili d'ambiente di Supabase
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.log('Email da inviare (RESEND_API_KEY non configurata):', {
        to,
        subject,
        htmlContent,
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged (RESEND_API_KEY not configured)',
          preview: { to, subject }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Invio effettivo con Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${template.from_name} <${template.from_email}>`,
        to: [to],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(`Errore invio email: ${error}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
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

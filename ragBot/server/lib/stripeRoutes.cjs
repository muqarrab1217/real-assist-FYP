const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

// Supabase admin client for webhook operations (no user session)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// ─────────────────────────────────────────────────────────────
// POST /api/stripe/create-customer
// Creates or retrieves a Stripe customer for the authenticated user
// ─────────────────────────────────────────────────────────────
router.post('/create-customer', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    // Check if user already has a Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('[STRIPE] Profile lookup error:', profileError);
      return res.status(500).json({ error: 'Failed to look up user profile' });
    }

    // Return existing customer if already created
    if (profile.stripe_customer_id) {
      return res.json({ customerId: profile.stripe_customer_id });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userEmail,
      name: profile.full_name || userEmail,
      metadata: { supabase_user_id: userId },
    });

    // Save Stripe customer ID to profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    if (updateError) {
      console.error('[STRIPE] Failed to save customer ID:', updateError);
    }

    console.log(`[STRIPE] Created customer ${customer.id} for user ${userId}`);
    return res.json({ customerId: customer.id });
  } catch (err) {
    console.error('[STRIPE] Create customer error:', err);
    return res.status(500).json({ error: 'Failed to create Stripe customer' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/stripe/create-subscription
// Creates a Stripe Checkout session for a subscription payment
// Body: { paymentId, clientId }
// ─────────────────────────────────────────────────────────────
router.post('/create-subscription', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { paymentId, clientId } = req.body;

    if (!paymentId || !clientId) {
      return res.status(400).json({ error: 'paymentId and clientId are required' });
    }

    const userId = req.user.id;

    // Get the payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ error: 'Payment already settled' });
    }

    // Stripe amount limits for PKR (~285 PKR/USD, minimum 50 cents ≈ ₨150)
    const STRIPE_MIN_PKR = 150;
    const STRIPE_MAX_PKR = 999999.99;
    if (payment.amount < STRIPE_MIN_PKR) {
      return res.status(400).json({
        error: `Amount too small for Stripe. Minimum is Rs ${STRIPE_MIN_PKR}. Please use the "Upload Payment Proof" option for smaller amounts.`,
        code: 'amount_too_small',
      });
    }
    if (payment.amount > STRIPE_MAX_PKR) {
      return res.status(400).json({
        error: `Amount (Rs ${Number(payment.amount).toLocaleString()}) exceeds Stripe's limit of Rs 999,999.99. Please use the "Upload Payment Proof" option for this payment.`,
        code: 'amount_too_large',
      });
    }

    // Get client details for metadata
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*, properties(name)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return res.status(404).json({ error: 'Client record not found' });
    }

    // Verify ownership
    if (client.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: profile?.full_name || req.user.email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);
    }

    // Determine the frontend URL for redirects
    const frontendUrl = process.env.VITE_APP_URL || 'http://localhost:3000';

    // Create a Stripe Checkout Session (one-time payment for the installment)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: `Installment #${payment.installment_number} — ${client.properties?.name || 'Property Payment'}`,
              description: `Payment for installment ${payment.installment_number}`,
            },
            unit_amount: Math.round(payment.amount * 100), // Stripe uses cents/paisa
          },
          quantity: 1,
        },
      ],
      metadata: {
        payment_id: paymentId,
        client_id: clientId,
        user_id: userId,
        installment_number: String(payment.installment_number),
      },
      success_url: `${frontendUrl}/client/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/client/payment-cancel?payment_id=${paymentId}`,
    });

    console.log(`[STRIPE] Created checkout session ${session.id} for payment ${paymentId}`);
    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('[STRIPE] Create subscription error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/stripe/webhook
// Handles Stripe webhook events (called by Stripe, not by frontend)
// IMPORTANT: This route uses express.raw() — must be registered BEFORE express.json()
// ─────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // In development without webhook secret, parse body directly
      console.warn('[STRIPE] No webhook secret configured — skipping signature verification');
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error('[STRIPE] Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`[STRIPE] Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { payment_id, client_id, user_id } = session.metadata;

        if (!payment_id) {
          console.warn('[STRIPE] checkout.session.completed missing payment_id metadata');
          break;
        }

        // Mark the payment as paid
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: 'stripe',
            verification_status: 'not_required',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', payment_id);

        if (updateError) {
          console.error('[STRIPE] Failed to update payment:', updateError);
        } else {
          console.log(`[STRIPE] Payment ${payment_id} marked as paid`);
        }

        // Update client's current_installment counter
        if (client_id) {
          const { data: clientData } = await supabaseAdmin
            .from('clients')
            .select('current_installment')
            .eq('id', client_id)
            .single();

          if (clientData) {
            await supabaseAdmin
              .from('clients')
              .update({
                current_installment: (clientData.current_installment || 0) + 1,
                payment_status: 'active',
              })
              .eq('id', client_id);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`[STRIPE] Payment intent succeeded: ${paymentIntent.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.error(`[STRIPE] Payment failed: ${paymentIntent.id}`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`[STRIPE] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('[STRIPE] Webhook processing error:', err);
  }

  // Always return 200 to acknowledge receipt
  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────
// GET /api/stripe/session-status/:sessionId
// Check status of a checkout session (for success page)
// ─────────────────────────────────────────────────────────────
router.get('/session-status/:sessionId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

    // If payment succeeded, mark it as paid in the database
    // (acts as a fallback for when webhooks can't reach localhost in dev)
    if (session.payment_status === 'paid' && session.metadata?.payment_id && supabaseAdmin) {
      const paymentId = session.metadata.payment_id;
      const clientId = session.metadata.client_id;

      // Check if already updated (idempotent)
      const { data: existing } = await supabaseAdmin
        .from('payments')
        .select('status')
        .eq('id', paymentId)
        .single();

      if (existing && existing.status !== 'paid') {
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'paid',
            paid_date: new Date().toISOString(),
            payment_method: 'stripe',
            verification_status: 'not_required',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', paymentId);

        if (updateError) {
          console.error('[STRIPE] session-status: Failed to update payment:', updateError);
        } else {
          console.log(`[STRIPE] session-status: Payment ${paymentId} marked as paid`);
        }

        // Update client's installment counter
        if (clientId) {
          const { data: clientData } = await supabaseAdmin
            .from('clients')
            .select('current_installment')
            .eq('id', clientId)
            .single();

          if (clientData) {
            await supabaseAdmin
              .from('clients')
              .update({
                current_installment: (clientData.current_installment || 0) + 1,
                payment_status: 'active',
              })
              .eq('id', clientId);
          }
        }
      }
    }

    return res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (err) {
    console.error('[STRIPE] Session status error:', err);
    return res.status(500).json({ error: 'Failed to retrieve session status' });
  }
});

module.exports = router;

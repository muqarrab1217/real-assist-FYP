import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function seedTestData() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123!";

  console.log(`Creating test user: ${email}`);

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: "Test",
        last_name: "User",
        role: "client",
      },
    },
  });

  if (authError) {
    console.error("Auth Error:", authError.message);
    return;
  }

  const userId = authData.user?.id;
  console.log(`User created with ID: ${userId}`);

  // 1b. Sign in to get a session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Sign In Error:", signInError.message);
    return;
  }

  // 1c. Elevate role to admin temporarily
  console.log("Elevating role to admin...");
  const { error: roleError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId);

  // 2. Find a property
  const { data: properties } = await supabase.from("properties").select("id, name").limit(1);
  if (!properties || properties.length === 0) {
    console.error("No properties found in database to enroll in.");
    return;
  }
  const propertyId = properties[0].id;

  // 3. Create Enrollment
  const totalPrice = 5000000;
  const downPayment = 1000000;
  const monthlyInstallment = 100000;

  const { data: enrollment, error: enrollError } = await supabase
    .from("project_enrollments")
    .insert([
      {
        user_id: userId,
        project_id: propertyId,
        total_price: totalPrice,
        down_payment: downPayment,
        installment_duration_years: 3,
        monthly_installment: monthlyInstallment,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (enrollError) {
    console.error("Enrollment Error:", enrollError.message);
    return;
  }

  // 4. Create Client record
  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      property_id: propertyId,
      investment_amount: totalPrice,
      total_installments: 36,
      status: "active",
    })
    .select()
    .single();

  if (clientErr) {
    console.error("Client Error:", clientErr.message);
    return;
  }

  // 5. Create Payments
  const paymentRecords = [];
  const today = new Date();

  for (let i = 1; i <= 12; i++) {
    // Make first installment due in 2 days to trigger "Critical Deadline"
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + (i === 1 ? 2 : i * 30));

    paymentRecords.push({
      client_id: client.id,
      amount: monthlyInstallment,
      installment_number: i,
      due_date: dueDate.toISOString(),
      billing_period: new Date(today.getFullYear(), today.getMonth() + i, 1).toISOString(),
      status: "pending",
      type: "installment",
    });
  }

  const { error: payError } = await supabase.from("payments").insert(paymentRecords);

  if (payError) {
    console.error("Payments Error:", payError.message);
  } else {
    console.log("Payments created successfully.");
  }

  // 6. Revert role to client
  console.log("Reverting role to client...");
  await supabase.from("profiles").update({ role: "client" }).eq("id", userId);

  console.log("\n✅ Success! Test data seeded.");
  console.log("----------------------------");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("----------------------------");
  console.log("You can now log in with these credentials to test the payments page.");
}

seedTestData().catch(console.error);

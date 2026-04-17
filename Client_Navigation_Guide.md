# ABS Developers – Client Navigation Guide
*This guide explains every part of the website from a client's perspective, including how to navigate to each page and what you can do there.*

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Homepage (Landing Page)](#2-homepage-landing-page)
3. [Browse Projects (Public)](#3-browse-projects-public)
4. [Project Detail Page (Public)](#4-project-detail-page-public)
5. [Registering an Account](#5-registering-an-account)
6. [Logging In](#6-logging-in)
7. [Forgot Password](#7-forgot-password)
8. [Client Dashboard Overview](#8-client-dashboard-overview)
9. [My Projects](#9-my-projects)
10. [Payments](#10-payments)
11. [Ledger (Statement of Account)](#11-ledger-statement-of-account)
12. [Project Updates](#12-project-updates)
13. [Chat History (AI Assistant)](#13-chat-history-ai-assistant)
14. [Get Help](#14-get-help)
15. [Submit Feedback](#15-submit-feedback)
16. [Settings](#16-settings)
17. [Common Tasks – Quick Reference](#17-common-tasks--quick-reference)
18. [Contact Information](#18-contact-information)

---

## 1. Getting Started

Welcome to the ABS Developers portal. Here is the typical flow for a new client:

```
Visit Homepage → Browse Projects → Register / Log In → Access Client Dashboard
```

Once you are logged in as a client, you will see a sidebar on the left side of the screen with navigation links to all your pages.

---

## 2. Homepage (Landing Page)

**URL:** `/` (the root of the website)

**How to get there:** Simply open the website URL in your browser. No login required.

**What you will see:**
- The ABS Developers logo and top navigation bar with links to **Projects**, **Login**, and **Register**.
- A hero section with a call-to-action button to explore projects.
- A features section highlighting key services: Smart Lead Management, Payment Automation, Analytics, Client Management, Real-time Updates, and Secure Compliance.
- A **Featured Projects** section showcasing available residential and commercial properties.
- **Testimonials** from existing clients.
- An **Experience & Vision** section about ABS Developers.

**Actions available without logging in:**
- Click **"Browse Projects"** or **"Explore Projects"** to go to the Projects page.
- Click **"Login"** in the top navigation to sign into your account.
- Click **"Register"** or **"Get Started"** to create a new account.

---

## 3. Browse Projects (Public)

**URL:** `/projects`

**How to get there:**
- From the Homepage, click **"Projects"** in the top navigation bar.
- Or directly visit `/projects`.

**What you will see:**
- A list of all available real estate projects.
- A **filter bar** at the top to filter projects by type: **All**, **Residential**, **Commercial**, **Mixed-Use**.
- Each project card shows the project name, location, type, and a brief description.

**Featured Projects available:**
1. ABS Mall & Residency 2 – Asaan Ghar Offer 2025
2. Pearl One Capital – Residential – Asaan Ghar Offer
3. Pearl One Capital – Commercial – Asaan Ghar Offer 2025
4. Pearl One Courtyard – Development Deal
5. Pearl One Premium – Development Deal

**Actions:**
- Click **"View Details"** on any project card to go to that project's detail page.
- Click **"Enroll Now"** on a project card to start the enrollment process (you must be logged in; if not, you will be redirected to login first).

---

## 4. Project Detail Page (Public)

**URL:** `/projects/:projectId` (e.g., `/projects/pearl_one_capital_-_residential`)

**How to get there:**
- From the Projects page, click **"View Details"** on any project card.

**What you will see:**
- Full project name, description, and location.
- **Unit Types** available in the project:
  - **Economy** – Basic units at lower price points.
  - **Premium** – Mid-tier units with enhanced features.
  - **Penthouse** – Luxury top-floor units.
- For each unit type: size, price per sqft, total price, and available count.
- **Payment Plans** – Installment breakdown showing down payment, monthly/quarterly installments, and total amount.
- **Blueprints** – Floor plans and layout images (if available).
- **Construction Phases** – Timeline of the project's construction milestones and completion percentage.
- **Gallery** – Images of the project.

**Actions:**
- Click **"Enroll in This Project"** to start the enrollment process. You will need to be logged in.
- Select a unit type and payment plan before confirming enrollment.

---

## 5. Registering an Account

**URL:** `/auth/register`

**How to get there:**
- From the Homepage, click **"Register"** or **"Get Started"** in the top navigation.
- Or directly visit `/auth/register`.

**What you need to fill in:**
| Field | Details |
|-------|---------|
| First Name | Your first name |
| Last Name | Your last name |
| Email Address | A valid email (will be used to log in) |
| Phone Number | Your contact number |
| Password | Minimum 6 characters |
| Confirm Password | Must match your password |
| Agree to Terms | Checkbox – must be checked to proceed |

Your role will automatically be set to **"Client"**.

**After registering:**
- You will be redirected to the login page or directly to your Client Dashboard.
- Your account will be created and you can begin exploring and enrolling in projects.

---

## 6. Logging In

**URL:** `/auth/login`

**How to get there:**
- From the Homepage, click **"Login"** in the top navigation.
- Or directly visit `/auth/login`.

**What you need:**
- Your registered **Email Address**.
- Your **Password**.

**Steps:**
1. Enter your email address in the **"Email Address"** field.
2. Enter your password in the **"Password"** field. Click the eye icon to show/hide your password.
3. Click **"Sign In"**.
4. You will see a loading sequence: *Signing in… Verifying credentials… Fetching user details… Initializing payment plans… Loading your dashboard…*
5. Once complete, you are redirected to your **Client Dashboard**.

**If login fails:**
- Double-check your email and password.
- If you forgot your password, click **"Forgot Password?"** below the sign-in button.

---

## 7. Forgot Password

**URL:** `/auth/forgot-password`

**How to get there:**
- On the Login page, click **"Forgot Password?"** link.

**Steps:**
1. Enter your registered **email address**.
2. Click **"Send Reset Link"**.
3. Check your email inbox for a password reset link.
4. Click the link in the email to set a new password.
5. If you don't see the email, check your **spam/junk folder**.

**After resetting:**
- Return to the Login page at `/auth/login` and sign in with your new password.

---

## 8. Client Dashboard Overview

**URL:** `/client/dashboard`

**How to get there:**
- After logging in, you are automatically redirected here.
- From anywhere in the client portal, click **"Dashboard"** in the left sidebar.

**What you will see on the Dashboard:**

### Financial Summary Cards (top of page)
Four cards showing your financial overview:
| Card | What it shows |
|------|--------------|
| **Total Invested** | Total value of all your property investments |
| **Amount Paid** | Total amount you have paid so far |
| **Pending Due** | Total amount still outstanding across all projects |
| **Monthly Due** | Amount due in the current month |

> **Tip:** Click the **eye icon** (👁) in the top-right of the financial section to hide/show the monetary amounts for privacy.

### Upcoming Payments Section
- Shows your next scheduled installments across all enrolled projects.
- Displays: project name, installment number, due date, and amount.
- **Overdue payments** are highlighted in red/amber with an alert.

### Recent Completed Payments
- A list of your most recently paid installments.
- Displays: project name, payment date, amount, and payment method.

### Quick Navigation
- The dashboard provides quick-access cards to navigate to **Payments**, **Ledger**, and **Project Updates**.

---

## 9. My Projects

**URL:** `/client/projects`

**How to get there:**
- In the left sidebar, click **"Projects"**.

**What you will see:**
- All real estate projects available on the platform.
- For projects you are already enrolled in, you will see your enrollment status.
- An **"Enroll"** button on projects you have not yet joined.

**Actions:**

### Enrolling in a Project
1. Find the project you want to join.
2. Click **"Enroll"** on that project's card.
3. An **Enrollment Modal** (popup) will appear showing:
   - Project name and details.
   - Available unit types (Economy / Premium / Penthouse) with sizes and prices.
   - Payment plan options.
4. Select your preferred **unit type** and **payment plan**.
5. Click **"Submit Enrollment Request"**.
6. Your enrollment request is sent to the ABS Developers team for review. You will be notified within **1–2 business days**.

### Browsing Inventory
- Click **"View Inventory"** or the inventory icon on a project to open the **Inventory Browser**.
- Browse available units by floor, type, and availability status.
- Units shown in green/gold are **available**; units in grey are **sold** or **reserved**.

---

## 10. Payments

**URL:** `/client/payments`

**How to get there:**
- In the left sidebar, click **"Payments"**.

**What you will see:**

### Overdue Alerts
- If you have any **overdue payments**, a red alert banner appears at the top listing the overdue installments and amounts.

### Payment Center (Project Matrix View)
- A summary grid showing all your enrolled projects and their payment status.
- Each row represents a project; columns show installment numbers, due dates, amounts, and status (Paid / Pending / Overdue).

### Making a Payment
**Method 1: Online Payment (Stripe)**
1. Find the installment you want to pay in the payment matrix.
2. Click **"Make Payment"** (or the payment button next to the installment).
3. A **Payment Method Modal** appears with two options.
4. Select **"Pay Online"** (credit/debit card via Stripe).
5. Enter your card details on the secure Stripe payment form.
6. Confirm and submit. Payment is processed instantly.
7. You will be redirected to a **Payment Success** page confirming completion.

**Method 2: Manual Payment (Bank Transfer / Cash)**
1. Make the payment through your bank or in person at the ABS office.
2. Return to the Payments page.
3. Find the relevant installment and click **"Upload Proof"**.
4. Click **"Choose File"** and select your payment receipt/screenshot.
5. Click **"Upload"** to submit. The admin team will verify and mark it as paid.

### Downloading a Receipt
- For any **completed payment**, click the **download icon** next to it.
- A PDF receipt will download to your device.

---

## 11. Ledger (Statement of Account)

**URL:** `/client/ledger`

**How to get there:**
- In the left sidebar, click **"Ledger"**.

**What you will see:**
- A full **Statement of Account** listing all financial transactions related to your investments.
- Each row shows: Date, Description, Debit (amount charged), Credit (amount paid), and Running Balance.

### Understanding the Ledger
| Column | Meaning |
|--------|---------|
| **Date** | When the transaction was recorded |
| **Description** | What the transaction was for (e.g., installment #3, down payment) |
| **Debit** | Money you owe / amount charged to your account |
| **Credit** | Money you have paid |
| **Balance** | Your running outstanding balance |

### Exporting Your Ledger
- Click **"Export PDF"** to download your statement as a PDF document.
- Click **"Export Excel"** to download your statement as a spreadsheet (.xlsx file).

> **Use the ledger** to keep track of your full payment history, verify past transactions, or share your statement with a financial advisor.

---

## 12. Project Updates

**URL:** `/client/updates`

**How to get there:**
- In the left sidebar, click **"Project Updates"**.

**What you will see:**
- A **project selector** dropdown at the top. Choose one of your enrolled projects to view its updates.
- Three tabs to explore different types of updates:

### Tab 1: Journal
- A chronological **news feed** of all updates for the selected project.
- Each entry shows: date, title, description, and any attached images.
- Examples: "Foundation work completed", "Structure work 40% complete", "Possession date confirmed".

### Tab 2: Timeline
- A **visual timeline** showing project milestones from start to estimated completion.
- Each milestone shows: phase name, planned date, completion percentage, and status (Completed / In Progress / Upcoming).

### Tab 3: Dossier
- A **detailed document view** with comprehensive project information.
- Includes: project specs, location details, developer information, legal documents, and certificates.

### Payment Calendar
- Below the tabs, a **payment calendar** shows your upcoming installment due dates for the selected project.
- Dates with payments due are highlighted in gold.

---

## 13. Chat History (AI Assistant)

**URL:** `/client/chat-history`

**How to get there:**
- In the left sidebar, click **"Chat History"**.

**What you will see:**
- A list of your **previous chat sessions** with Sara, the ABS AI assistant.
- Each session shows the date and a preview of the conversation.

**How to use the AI Chatbot (Sara):**
1. Click **"New Chat"** to start a fresh conversation.
2. Type your question in the message input at the bottom.
3. Press **Enter** or click the **Send** button.
4. Sara will respond with helpful information about your projects, payments, navigation guidance, and general real estate questions.
5. Your conversation is saved automatically.

**What Sara can help you with:**
- How to navigate to any page on the portal.
- Information about your payments and outstanding dues.
- Questions about enrolled projects and their updates.
- General information about ABS Developers projects and units.
- Real estate guidance and FAQs.

**Accessing previous conversations:**
- Click on any past session in the left panel to load and continue that conversation.

---

## 14. Get Help

**URL:** `/client/get-help`

**How to get there:**
- In the left sidebar, scroll to the bottom and click **"Get Help"**.

**What you will see:**

### Frequently Asked Questions (FAQs)
The Help page contains answers to the most common questions:

| # | Question | Answer Summary |
|---|----------|---------------|
| 1 | How do I track my payment installments? | Go to **Payments** in the sidebar to see all your installments and their statuses. |
| 2 | How do I view project updates? | Go to **Project Updates** in the sidebar, then select your enrolled project. |
| 3 | How do I change my password? | Go to **Settings** → **Security** section → enter current and new password. |
| 4 | How do I submit a support request? | Click **"Submit Feedback"** in the sidebar or contact us by phone/email. |
| 5 | Why is my enrollment still pending? | Enrollment requests are reviewed by the team within **1–2 business days**. |
| 6 | How do I download a payment receipt? | Go to **Payments**, find the completed payment, and click the **download icon**. |

### Search FAQs
- Use the **search bar** at the top to find answers by keyword.

### Contact Section
- **Phone:** +92 320-0000-022
- **Email:** Contact details listed on the page.
- You can also call or email the ABS Developers team directly for personalized support.

---

## 15. Submit Feedback

**URL:** `/client/submit-feedback`

**How to get there:**
- In the left sidebar, scroll to the bottom and click **"Submit Feedback"**.

**What you will see:**
A feedback form to share your experience or suggestions.

**Fields to fill in:**
| Field | Details |
|-------|---------|
| **Subject** | A short title for your feedback |
| **Category** | Choose from: General, Payment Issue, Project Inquiry, Technical Problem, Suggestion |
| **Message** | Detailed description of your feedback or issue |
| **Rating** | Star rating (1–5) to rate your experience |

**Steps:**
1. Enter a **Subject** for your message.
2. Select the relevant **Category** from the dropdown.
3. Write your **Message** in the text area.
4. Click the **stars** to give a rating (optional but appreciated).
5. Click **"Submit Feedback"**.
6. A confirmation message: *"Thank you! Your feedback has been submitted successfully."* will appear.

---

## 16. Settings

**URL:** `/client/settings`

**How to get there:**
- In the left sidebar, click **"Settings"**.

**What you will see – two sections:**

### Section 1: Edit Profile
Update your personal information.

| Field | Details |
|-------|---------|
| **First Name** | Update your first name |
| **Last Name** | Update your last name |
| **Phone Number** | Update your contact number |
| **Email** | Displayed but cannot be changed here (contact support) |

**Steps to update profile:**
1. Edit any of the fields (First Name, Last Name, Phone).
2. Click **"Save Changes"**.
3. A success message confirms the update.

### Section 2: Change Password
Update your login password.

| Field | Details |
|-------|---------|
| **Current Password** | Your existing password |
| **New Password** | Your new password (minimum 6 characters) |
| **Confirm New Password** | Re-enter new password to confirm |

**Steps to change password:**
1. Enter your **Current Password**.
2. Enter your desired **New Password** (must be at least 6 characters).
3. Re-enter the new password in **Confirm New Password**.
4. Click **"Update Password"**.
5. A success message confirms your password has been changed.

### Section 3: Notification Preferences
Toggle switches to control which notifications you receive:
- Payment reminders
- Project milestone updates
- Promotional announcements

---

## 17. Common Tasks – Quick Reference

| Task | Where to Go | Steps |
|------|------------|-------|
| **View my financial summary** | Dashboard (`/client/dashboard`) | Log in → Click "Dashboard" in sidebar |
| **See upcoming payments** | Dashboard or Payments | Sidebar → "Dashboard" or "Payments" |
| **Make an online payment** | Payments (`/client/payments`) | Sidebar → "Payments" → Click "Make Payment" → Choose "Pay Online" |
| **Upload payment proof** | Payments (`/client/payments`) | Sidebar → "Payments" → Find installment → Click "Upload Proof" |
| **Download payment receipt** | Payments (`/client/payments`) | Sidebar → "Payments" → Find completed payment → Click download icon |
| **View full transaction history** | Ledger (`/client/ledger`) | Sidebar → "Ledger" |
| **Export statement as PDF** | Ledger (`/client/ledger`) | Sidebar → "Ledger" → Click "Export PDF" |
| **Enroll in a project** | Projects (`/client/projects`) | Sidebar → "Projects" → Click "Enroll" → Select unit & plan → Submit |
| **Check project construction status** | Project Updates (`/client/updates`) | Sidebar → "Project Updates" → Select project → View Timeline tab |
| **Read project news/announcements** | Project Updates (`/client/updates`) | Sidebar → "Project Updates" → Select project → View Journal tab |
| **Change my password** | Settings (`/client/settings`) | Sidebar → "Settings" → Security section → Enter passwords → Update |
| **Update my phone number** | Settings (`/client/settings`) | Sidebar → "Settings" → Edit Profile → Change phone → Save |
| **Chat with AI assistant** | Chat History (`/client/chat-history`) | Sidebar → "Chat History" → New Chat → Type question |
| **Find answers to questions** | Get Help (`/client/get-help`) | Sidebar → "Get Help" → Browse FAQs or search |
| **Submit a complaint / suggestion** | Submit Feedback (`/client/submit-feedback`) | Sidebar → "Submit Feedback" → Fill form → Submit |
| **Browse available units in a project** | Projects (`/client/projects`) | Sidebar → "Projects" → Click "View Inventory" on project |
| **Contact ABS Developers by phone** | Get Help or anywhere | Call **+92 320-0000-022** |

---

## 18. Contact Information

For any assistance, you can reach the ABS Developers team:

| Method | Details |
|--------|---------|
| **Phone** | +92 320-0000-022 |
| **In-app Chat** | Use Sara AI Assistant at `Chat History` in the sidebar |
| **Feedback Form** | Use `Submit Feedback` in the sidebar |
| **Help Page** | Visit `Get Help` in the sidebar for FAQs |

**Office Hours:** Contact the team through the portal for current office hours and location.

---

## Sidebar Navigation Summary

Once logged in as a client, your sidebar shows these links (from top to bottom):

| Sidebar Item | Goes To | Purpose |
|-------------|---------|---------|
| **Dashboard** | `/client/dashboard` | Financial overview and upcoming payments |
| **Projects** | `/client/projects` | Browse all projects and enroll |
| **Payments** | `/client/payments` | Make payments and upload proofs |
| **Ledger** | `/client/ledger` | Full statement of account |
| **Project Updates** | `/client/updates` | Construction news, timeline, and dossier |
| **Chat History** | `/client/chat-history` | Talk to Sara AI assistant |
| **Settings** | `/client/settings` | Update profile and change password |
| **Get Help** | `/client/get-help` | FAQs and contact info |
| **Submit Feedback** | `/client/submit-feedback` | Send feedback or report issues |
| **Logout** | — | Ends your session securely |

---

*This guide is maintained by ABS Developers. For further help, contact us at +92 320-0000-022 or use the in-app Sara AI chatbot.*

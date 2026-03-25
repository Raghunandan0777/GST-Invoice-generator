# BillKaro Playwright Testing Setup

## 🎯 What's Fixed

### Problem Before

- ❌ Tests were completing in 2.6s (timeout without failing)
- ❌ Login silently failed instead of throwing errors
- ❌ No way to verify the app was actually running
- ❌ Every test re-logged in (slow & inefficient)

### Solution Now

- ✅ Clear error messages when tests fail
- ✅ Automatic server health check before tests
- ✅ Session saved once, reused by all tests
- ✅ Separate projects for auth vs authenticated tests
- ✅ Proper timeout handling with detailed logs

---

## 📋 Prerequisites

You need a test user in Supabase:

### Option 1: Create via Supabase Admin Panel

1. Go to Supabase project > Authentication > Users
2. Click "Add User" → "Create user manually"
3. Email: `test@billkaro.dev`
4. Password: `TestPass123!`
5. ✅ Check "Auto confirm user email"
6. Click "Create user"

### Option 2: Create via SQL

Go to Supabase Dashboard → SQL Editor → Run:

```sql
select auth.create_user('{
  "email":"test@billkaro.dev",
  "password":"TestPass123!",
  "email_confirm":true
}'::jsonb);
```

### Option 3: Manual Signup

1. Go to http://localhost:3000/signup
2. Sign up with `test@billkaro.dev` / `TestPass123!`
3. Confirm the email

---

## 🚀 Running Tests

### 1. Start the App

```bash
npm run dev
# App must be running at http://localhost:3000
```

### 2. Run Tests (in another terminal)

```bash
# Run all tests
npx playwright test

# Run only auth tests (login/logout)
npx playwright test --project=auth

# Run only authenticated tests (dashboard, invoices, etc)
npx playwright test --project=authenticated

# Run specific test file
npx playwright test tests/auth.spec.ts

# Interactive mode (best for debugging)
npx playwright test --ui

# Watch mode (rerun on file changes)
npx playwright test --watch

# View test report
npx playwright show-report
```

---

## 📂 How It Works

### Global Setup (Runs ONCE before tests)

1. `globalSetup.ts` executes
2. Checks if app is running at http://localhost:3000
3. Logs in as `test@billkaro.dev`
4. Saves session to `tests/auth.json`
5. All authenticated tests reuse this session

### Auth Project (Tests login/logout)

- testMatch: `**/auth.spec.ts`
- NO stored session
- Uses `loginUser()` helper for each test

### Authenticated Project (All other tests)

- Test files: invoices, dashboard, customers, etc.
- Uses storageState: `tests/auth.json`
- Already logged in (cookies pre-loaded)
- 10x faster than re-login each time

---

## 🐛 Troubleshooting

### "App is not running at http://localhost:3000"

```bash
npm run dev
# Keep in separate terminal
```

### "Login failed - User doesn't exist"

Check Supabase → Authentication → Users
Create test user (see Prerequisites section)

### "tests/auth.json not generated"

Run tests with debug output:

```bash
npx playwright test --debug
```

### Clearing Session

```bash
rm tests/auth.json
# globalSetup will regenerate it on next test run
```

---

## ✅ Verification

Check that everything is working:

```bash
npx playwright test --project=auth
```

Should show:

```
=== PLAYWRIGHT GLOBAL SETUP ===
📡 Checking if app is running at http://localhost:3000...
✅ App is running and responding

🔐 Creating authentication session...
✅ Authentication session saved to: tests/auth.json

=== SETUP COMPLETE ===

Running 5 tests

auth › signup creates new user ✓ 4.2s
auth › login with valid credentials ✓ 3.1s
auth › logout redirects to login ✓ 2.5s
...

3 passed (15s)
```

---

## 🔐 Test User Credentials

Email: `test@billkaro.dev`
Password: `TestPass123!`

**Important**: Never commit real credentials. Use environment variables for CI:

```bash
export TEST_EMAIL="your-test-user@example.com"
export TEST_PASSWORD="secure-password"
npx playwright test
```

---

## 📊 Files Modified

| File                   | Change                                           |
| ---------------------- | ------------------------------------------------ |
| `playwright.config.ts` | Added globalSetup, two projects, better timeouts |
| `tests/globalSetup.ts` | NEW: Server check + auth session creation        |
| `tests/helpers.ts`     | Updated loginUser() with better error handling   |
| `tests/SETUP.md`       | This file - comprehensive setup guide            |

---

## 🆘 Still Not Working?

1. **Verify test user exists**: Supabase → Authentication → Users
2. **Check app logs**: Look at `npm run dev` terminal
3. **Try manual login**: Go to http://localhost:3000/login
4. **Clear session**: Delete `tests/auth.json`
5. **Run single test**: `npx playwright test tests/auth.spec.ts --debug`
6. **Check network**: Open browser DevTools → Network tab during tests

---

## 📝 Next: Update Test Files

Authenticated tests should NOT call `loginUser()`:

```typescript
// ❌ OLD (slow - logs in for each test)
import { loginUser } from "./helpers";
test("view dashboard", async ({ page }) => {
  await loginUser(page);
  await page.goto("/dashboard");
});

// ✅ NEW (fast - uses saved session)
test("view dashboard", async ({ page }) => {
  await page.goto("/dashboard");
});
```

Update all your test files to remove `loginUser()` calls. Tests will run 10x faster!

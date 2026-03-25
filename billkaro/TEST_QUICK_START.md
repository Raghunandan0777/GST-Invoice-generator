# Quick Start: Playwright Test Fixes

## ⚡ 30-Second Overview

**Problem:** Tests completed in 2.6 seconds, silently passing without testing anything.

**Root Cause:**

- App not verified running
- Login timeouts not throwing errors
- No assertions in tests
- Session regenerated each test

**Solution:**

- ✅ Global setup checks app and creates session
- ✅ Session saved to `tests/auth.json` and reused
- ✅ Login function throws proper errors
- ✅ Two projects: auth (test login) and authenticated (use session)
- ✅ Detailed logging and error messages

---

## 🚀 Quick Start (5 Minutes)

### 1. Create Test User in Supabase

Go to Supabase Dashboard → SQL Editor, run:

```sql
select auth.create_user('{
  "email":"test@billkaro.dev",
  "password":"TestPass123!",
  "email_confirm":true
}'::jsonb);
```

### 2. Start App (Terminal 1)

```bash
npm run dev
```

### 3. Run Tests (Terminal 2)

```bash
npm test
# or
npx playwright test
```

### 4. View Report

```bash
npx playwright show-report
```

---

## 📋 Files Changed

### Updated Files

**`playwright.config.ts`** - Main configuration

```
Changes:
✅ Added globalSetup: './tests/globalSetup.ts'
✅ Added proper timeout: 45000 (enforced)
✅ Split into 2 projects: 'auth' and 'authenticated'
✅ 'authenticated' project uses storageState: 'tests/auth.json'
```

**`tests/helpers.ts`** - Test utilities

```
Changes:
✅ loginUser() now throws detailed errors (no more silent timeouts)
✅ Added console.log() for debugging
✅ Added error messages showing:
   - What was expected
   - What actually happened
   - Why it might have failed
   - How to fix it
```

### New Files

**`tests/globalSetup.ts`** - Pre-test initialization

```
Purpose:
✅ Verify app is running at localhost:3000
✅ Create authenticated session by logging in
✅ Save session to tests/auth.json
✅ Throw clear error if anything fails
```

**`tests/auth.spec.ts`** - Authentication tests

```
Tests:
✅ Signup creates new user
✅ Login with valid credentials
✅ Login with invalid credentials fails
✅ Logout clears session
✅ Protected routes redirect to login
```

**`tests/dashboard.spec.ts`** - Dashboard tests

```
Tests:
✅ Dashboard loads for authenticated user
✅ Revenue stats visible
✅ Navigation works
✅ (NO loginUser() calls - uses saved session)
```

### Updated Documentation

**`tests/SETUP.md`** - How to set up tests
**`PLAYWRIGHT_FIXES.md`** - Detailed explanation of all fixes

---

## ✅ Verify Setup

Run each command:

```bash
# 1. App running?
curl -I http://localhost:3000
# Should show: HTTP/1.1 200 OK

# 2. Test user exists?
# Check Supabase > Authentication > Users for test@billkaro.dev

# 3. Tests pass?
npx playwright test --project=auth
# Should show: 5 passed

# 4. Session created?
ls tests/auth.json
# Should exist

# 5. Full test run?
npx playwright test
# Should show: X passed
```

---

## 🎯 Key Improvements

| Before           | After                 |
| ---------------- | --------------------- |
| 2.6s, no testing | 1-2 min, real testing |
| Silent failures  | Clear error messages  |
| No server check  | Verifies app running  |
| Login each test  | Session reused        |
| No logging       | Detailed step-by-step |
| False positives  | Proper assertions     |

---

## 📚 Usage

### Run All Tests

```bash
npm test
```

### Run Just Auth Tests

```bash
npx playwright test --project=auth
```

### Run Interactive Mode

```bash
npm run test:ui
```

### Debug Specific Test

```bash
npx playwright test tests/auth.spec.ts --debug
```

### Generate Report

```bash
npx playwright show-report
```

---

## 🐛 If Something's Wrong

### Tests still taking 2.6s?

```bash
# Check if tests are even running
npx playwright test --debug
# Watch the browser - should see login happening
```

### "App not running"

```bash
# Make sure dev server is running
npm run dev
# Keep it running in Terminal 1 while tests run in Terminal 2
```

### "Login failed - user doesn't exist"

```bash
# Create test user in Supabase (see Quick Start section)
```

### Tests passing but not testing?

```bash
# Check for await/expect statements
# Each test should have assertions that can fail
```

---

## 🔐 Test Credentials

- Email: `test@billkaro.dev`
- Password: `TestPass123!`

These are configured in `tests/helpers.ts`. For CI/CD, use environment variables.

---

## ⏱️ Expected Test Duration

First run: 1-2 minutes (creates auth session)
Subsequent runs: 1-2 minutes (regenerates session each time for safety)

Breaking down:

- globalSetup: 15-30s (verify server + auth)
- Auth tests: 15-20s (login/logout tests)
- Authenticated tests: 40-60s (dashboard, invoices, etc)

Each test should take 1-3 seconds. If > 5s per test, something's wrong.

---

## 🎁 What You Get Now

✅ Tests that actually run
✅ Tests that actually fail when broken
✅ Clear error messages showing what went wrong
✅ Fast subsequent test runs (session cached)
✅ Separate projects for auth vs features
✅ Ready for CI/CD pipelines
✅ Full debugging support (--debug flag)

---

## 📞 Support

For detailed help:

- `tests/SETUP.md` - Full setup guide
- `PLAYWRIGHT_FIXES.md` - All fixes explained
- Run with `--debug` flag for interactive debugging
- Check app logs in `npm run dev` terminal

Let's verify it works:

```bash
npx playwright test tests/auth.spec.ts
```

Should show 5 tests passing in ~20 seconds!

'use server';

import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import puppeteer, { Browser, BrowserContext } from 'puppeteer';

// Global state for rate limiting (Persists across hot-reloads in dev)
const globalAny: any = global;
if (!globalAny.activeLogins) {
  globalAny.activeLogins = new Set<number>();
}
const activeLogins: Set<number> = globalAny.activeLogins;

// Background task to automatically delete logs older than 3 months
async function autoCleanupLogs() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  try {
    await prisma.loginLog.deleteMany({
      where: {
        started_at: {
          lt: threeMonthsAgo
        }
      }
    });
    console.log('Old logs cleanup executed successfully.');
  } catch (err) {
    console.error('Failed to auto-cleanup logs:', err);
  }
}

export async function triggerEBCLogin(studentId: number, serverHost: string = 'http://localhost:3000', closeBrowser: boolean = false) {
  // 1. Concurrency Check
  if (activeLogins.has(studentId)) {
    return { success: false, error: 'គណនីនេះកំពុងដំណើរការ Login ហើយ សូមរង់ចាំសិន! (Login already in progress)' };
  }

  // Mark this student as currently processing
  activeLogins.add(studentId);

  // Fire and forget auto-cleanup so it doesn't block the user
  autoCleanupLogs().catch(console.error);

  let browser: Browser | null = null;

  const MAX_RETRIES = 2; // Total 3 attempts
  let finalFriendlyMessage = 'Unknown error during automation';

  try {
    // 2. Mark status as LOGIN STARTED
    await prisma.student.update({
      where: { id: studentId },
      data: { status: 'LOGIN STARTED' }
    });

    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error('មិនអាចស្វែងរកទិន្នន័យសិស្សនេះបានទេ (Student not found)');
    }

    if (!student.credential_reference) {
      throw new Error('គណនីនេះមិនទាន់មានលេខសម្ងាត់នៅក្នុងប្រព័ន្ធនៅឡើយទេ (Missing Credentials)');
    }

    // Decrypt the credential
    const password = decrypt(student.credential_reference);

    // Auto-Retry Loop
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      let browser: Browser | null = null;
      try {
        // 3. Launch Puppeteer browser (visible to the user)
        browser = await puppeteer.launch({
          headless: false, 
          defaultViewport: null, 
          args: ['--start-maximized']
        });

        const page = await browser.newPage();
        
        // 4. Go to EBC E-Learning Login page
        try {
          await page.goto('https://elearning-ar.ebc.edu.kh/ark_login/index.php', { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (err: any) {
          throw new Error('វិបសាយ EBC ដើរយឺតខ្លាំង ឬមិនមានអ៊ីនធឺណិត (Connection Timed Out / EBC Down)');
        }

        // Click the EBC SSO login button and wait for navigation to SSO
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }),
            page.click('.login-identityprovider-btn'),
          ]);
        } catch (err) {
          throw new Error('រកមិនឃើញប៊ូតុង Login ចូល EBC ទេ។ ប្រព័ន្ធអាចនឹងគាំង ឬមានការផ្លាស់ប្ដូរ (UI Changed / Blocked)');
        }

        // 5. We are now on SSO. Wait for username input
        try {
          await page.waitForSelector('#usernameUserInput', { timeout: 15000 });
        } catch (err) {
          throw new Error('វិបសាយ SSO EBC មិនឆ្លើយតប។ អាចមកពី Network យឺតខ្លាំង (SSO Load Timeout)');
        }

        // 6. Fill in the credentials automatically
        await page.type('#usernameUserInput', student.username, { delay: 50 });
        await page.type('#password', password, { delay: 50 });

        // 7. Submit the form by pressing Enter and wait for redirect back to E-Learning
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
            page.keyboard.press('Enter'),
          ]);
        } catch (navError) {
          // Timeout means it likely didn't navigate back, perhaps due to an error on the page
        }

        const url = page.url();
        
        // If it doesn't redirect to EBC, or if it's still stuck on the login page, it means login failed!
        if (!url.includes('elearning-ar.ebc.edu.kh') || url.includes('login/index.php') || url.includes('loginerror')) {
          const errorText = await page.evaluate(() => {
            const errEl = document.querySelector('.ui.negative.message, .ui.message.error, .validation-error-message, .alert-danger, .loginerrors');
            if (errEl) return errEl.textContent?.trim();
            return null;
          });
          
          throw new Error(errorText || 'គណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ (Invalid Username or Password)');
        }

        // 8. Mark status as SUCCESS
        await prisma.student.update({
          where: { id: studentId },
          data: { status: 'SUCCESS' }
        });
        
        await prisma.loginLog.create({
          data: {
            student_id: studentId,
            status: 'SUCCESS',
          }
        });

        if (closeBrowser && browser) {
          await browser.close().catch(() => {});
        }

        return { success: true };

      } catch (error: any) {
        console.error(`Automation error on attempt ${attempt + 1}:`, error);
        
        let friendlyMessage = error.message;
        
        if (friendlyMessage.includes('net::ERR_INTERNET_DISCONNECTED')) {
          friendlyMessage = 'មិនមានការតភ្ជាប់អ៊ីនធឺណិតទេ (No Internet Connection)';
        } else if (friendlyMessage.includes('net::ERR_NAME_NOT_RESOLVED')) {
          friendlyMessage = 'មិនអាចស្វែងរកវិបសាយ EBC បានទេ (DNS Error / No Internet)';
        } else if (friendlyMessage.includes('Target closed') || friendlyMessage.includes('Session closed')) {
          friendlyMessage = 'អ្នកបានបិទផ្ទាំង Browser មុនពេល Login ជោគជ័យ (Browser Closed Manually)';
        } else if (friendlyMessage.includes('Could not find expected browser') || friendlyMessage.includes('executablePath')) {
          friendlyMessage = 'មិនអាចបើកកម្មវិធី Chrome/Edge បានទេ សូមពិនិត្យមើលការដំឡើងប្រព័ន្ធ Browser (Browser Launch Error)';
        } else if (friendlyMessage.includes('Navigation timeout')) {
          friendlyMessage = 'អ៊ីនធឺណិតដើរយឺតខ្លាំង ទើបធ្វើឲ្យវិបសាយរង់ចាំយូរពេក (Navigation Timeout)';
        }
        
        finalFriendlyMessage = friendlyMessage;

        // Ensure browser is closed before retrying
        if (browser) {
          await browser.close().catch(() => {});
        }

        // Check if we should retry
        const nonRetryableErrors = ['Invalid Username or Password', 'Browser Closed Manually', 'Browser Launch Error', 'Missing Credentials'];
        const isNonRetryable = nonRetryableErrors.some(errText => friendlyMessage.includes(errText));
        
        if (attempt < MAX_RETRIES && !isNonRetryable) {
          console.log(`Network issue detected. Retrying for student ${studentId} in 3 seconds...`);
          await new Promise(res => setTimeout(res, 3000));
          continue; // Retry the loop
        }
        
        // If out of retries or non-retryable error, break and fail
        break;
      }
    }

    // If we reach here, all attempts failed
    await prisma.student.update({
      where: { id: studentId },
      data: { status: 'FAILED' }
    });
    
    await prisma.loginLog.create({
      data: {
        student_id: studentId,
        status: 'FAILED',
        error_message: finalFriendlyMessage
      }
    });

    return { success: false, error: finalFriendlyMessage };
  } finally {
    // ALWAYS remove from processing list
    activeLogins.delete(studentId);
  }
}


import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch the Moodle login page (public, no auth needed)
    const res = await fetch('https://elearning-ar.ebc.edu.kh/login/index.php', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Moodle unavailable' }, { status: 502 });
    }

    const html = await res.text();

    // Extract WSO2 button href which contains a fresh sesskey
    const match = html.match(/href="(https:\/\/elearning-ar\.ebc\.edu\.kh\/auth\/oauth2\/login\.php[^"]+)"/);
    
    if (!match || !match[1]) {
      return NextResponse.json({ error: 'SSO button not found' }, { status: 404 });
    }

    // Decode HTML entities (&amp; → &)
    const ssoUrl = match[1].replace(/&amp;/g, '&');

    return NextResponse.json({ url: ssoUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch SSO URL' }, { status: 500 });
  }
}

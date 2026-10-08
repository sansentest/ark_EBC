import { NextResponse } from 'next/server';
import { triggerEBCLogin } from '@/app/actions/automationActions';

export async function POST(req: Request) {
  try {
    const { studentId, serverHost, closeBrowser } = await req.json();
    const result = await triggerEBCLogin(studentId, serverHost, closeBrowser);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

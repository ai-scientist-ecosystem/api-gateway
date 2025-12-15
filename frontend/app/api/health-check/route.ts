import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get('service');
  const port = searchParams.get('port');

  if (!service || !port) {
    return NextResponse.json(
      { status: 'DOWN', error: 'Missing service or port parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`http://localhost:${port}/actuator/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ status: data.status || 'UP' });
    } else {
      return NextResponse.json({ status: 'DOWN' });
    }
  } catch (error) {
    console.error(`Health check failed for ${service}:`, error);
    return NextResponse.json({ status: 'DOWN' });
  }
}

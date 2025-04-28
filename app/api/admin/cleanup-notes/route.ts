import { NextResponse } from 'next/server';
import { cleanupClientNotes } from '@/lib/utils/cleanup-notes';

/**
 * Admin API route to clean up client notes
 * This removes any "Sessions attended" text that might still be in the notes
 * and ensures we only use the sessionCount field for package tracking
 */
export async function GET() {
  try {
    // For production, you would add authorization checks here
    // if (!isAuthorizedAdmin(request)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const result = await cleanupClientNotes();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in cleanup notes API:', error);
    return NextResponse.json(
      { error: 'Failed to clean up notes' },
      { status: 500 }
    );
  }
}

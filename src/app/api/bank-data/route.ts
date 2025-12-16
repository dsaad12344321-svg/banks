import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'bank-certificates.json');
    const fileContents = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading bank data:', error);
    return NextResponse.json(
      { error: 'Failed to load bank data' },
      { status: 500 }
    );
  }
}
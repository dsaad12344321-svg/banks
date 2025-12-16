import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { banks } = await request.json();

    // Validate the data structure
    if (!Array.isArray(banks)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // File path
    const filePath = path.join(process.cwd(), 'src', 'data', 'bank-certificates.json');
    
    // Write to JSON file
    await writeFile(filePath, JSON.stringify({ banks }, null, 2), 'utf8');

    return NextResponse.json(
      { success: true, message: 'Data saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving bank data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // File path
    const filePath = path.join(process.cwd(), 'src', 'data', 'bank-certificates.json');
    
    // Read the file
    const fileContents = await readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error reading bank data:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
}
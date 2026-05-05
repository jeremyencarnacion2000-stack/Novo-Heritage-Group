import { NextResponse } from "next/server"

export async function GET() {
  const envNames = Object.keys(process.env).filter(key => 
    key.includes('URL') || 
    key.includes('AUTH') || 
    key.includes('SUPABASE') || 
    key.includes('GOOGLE') ||
    key.includes('DATABASE')
  );
  
  const env = envNames.reduce((acc, key) => {
    acc[key] = process.env[key]?.substring(0, 10) + '...'; // Only show start for security
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(env);
}

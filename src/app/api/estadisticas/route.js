import { NextResponse } from 'next/server';
import { obtenerEstadisticas } from '@/lib/supabase';

export async function GET() {
  try {
    const stats = await obtenerEstadisticas();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error en /api/estadisticas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudieron recuperar las estadísticas.',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { registrarVisita, obtenerContadorVisitas } from '@/lib/visitas';
import { validarOrigen } from '@/lib/seguridad';

function obtenerIp(request) {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  return request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip') || 'desconocido';
}

export async function GET() {
  try {
    const data = await obtenerContadorVisitas();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en GET /api/visitas:', error);
    return NextResponse.json({ success: false, error: 'No se pudo obtener el contador.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!validarOrigen(request)) {
    return NextResponse.json({ success: false, error: 'Origen no permitido.' }, { status: 403 });
  }

  try {
    const data = await registrarVisita({
      ip: obtenerIp(request),
      userAgent: request.headers.get('user-agent') || '',
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error en POST /api/visitas:', error);
    return NextResponse.json({ success: false, error: 'No se pudo registrar la visita.' }, { status: 500 });
  }
}

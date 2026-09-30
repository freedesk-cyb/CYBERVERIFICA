export async function GET() {
  return new Response('google-site-verification: google9d0c81156e240298.html', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

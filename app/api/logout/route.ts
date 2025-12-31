export async function POST() {
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  
    // Cookieを即時無効化してログアウト
    response.headers.set(
      "Set-Cookie",
      "session_token=; Path=/; HttpOnly; Max-Age=0"
    );
  
    return response;
  }
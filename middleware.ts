import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-at-least-32-chars"
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;
  const { pathname } = req.nextUrl;

  // 1. 公開パスの設定 (ログイン画面)
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";

  // --- ルートパス (/) へのアクセス処理 ---
  if (isRootPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // --- ログインページ (/login) へのアクセス処理 ---
  if (isLoginPage) {
    if (token) {
      try {
        // すでにログイン済みなら /top へ自動遷移
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.redirect(new URL("/top", req.url));
      } catch (e) {
        // トークンが無効なら、そのまま /login を表示（Cookieを消すとより親切）
        const res = NextResponse.next();
        res.cookies.delete("session_token");
        return res;
      }
    }
    return NextResponse.next();
  }

  // --- 保護されたページへのアクセス処理 ---
  if (!token) {
    // トークンがないなら /login へ
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // トークンの妥当性を検証
    await jwtVerify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (err) {
    // トークンが不正な場合はCookieを削除して /login へ
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session_token");
    return response;
  }
}

// 適用範囲の設定
export const config = {
  matcher: [ 
    /*
     * 以下のパスに対してミドルウェアを適用します
     */
    "/",
    "/login",
    "/top/:path*",
    "/password-change/:path*",
  ],
};
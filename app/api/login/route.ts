import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword, verifyPassword } from "@/lib/password";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "入力不足です" }),
        { status: 400 }
      );
    }

    // mt_user テーブルからユーザー情報取得（user_nameで検索）
    const { data, error } = await supabase
      .from("mt_user")
      .select("*")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ success: false, message: "ユーザーが見つかりません" }),
        { status: 401 }
      );
    }
    // ハッシュ化されたパスワードと比較
    const isValidPassword = await verifyPassword(password, data.password);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ success: false, message: "パスワードが正しくありません" }),
        { status: 401 }
      );
    }

    // 成功時は 200 を返す
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ success: false, message: "サーバーエラー" }),
      { status: 500 }
    );
  }
}
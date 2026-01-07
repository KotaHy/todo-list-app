import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword } from "@/lib/password"; // lib/password.ts が必要

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "ユーザー名とパスワードを入力してください" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mt_user") // テーブル名が mt_users の場合は変更
      .select("*")
      .eq("user_name", username)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, message: "ユーザー名またはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, data.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "ユーザー名またはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
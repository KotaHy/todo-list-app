import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mt_user") // テーブル名が mt_users の場合は変更
      .select("id, user_name")
      .order("user_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, users: data }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}



export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "ユーザー名とパスワードは必須です" }, { status: 400 });
    }

    // ユーザー名の重複チェック
    const { data: existingUser, error: fetchError } = await supabase
      .from("mt_user")
      .select("id")
      .eq("user_name", username)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, message: "このユーザー名は既に使用されています" }, { status: 409 });
    }
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116はデータが見つからないエラー
        console.error("ユーザー重複チェックエラー:", fetchError);
        return NextResponse.json({ success: false, message: "ユーザー重複チェックに失敗しました" }, { status: 500 });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // mt_user テーブルにユーザーを登録
    const { data, error } = await supabase.from("mt_user").insert([
      {
        user_name: username,
        password: hashedPassword,
      },
    ]).select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data[0] }, { status: 201 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ success: false, message: "サーバーエラーが発生しました" }, { status: 500 });
  }
}


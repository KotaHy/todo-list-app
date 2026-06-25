import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtVerify } from "jose"; // 追加

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT署名用の秘密鍵（環境変数に設定してください）
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-fallback-secret-key-at-least-32-chars"
);

export async function GET(req: NextRequest) {
  try {
    // ログインユーザーのIDを取得
    const sessionToken = req.cookies.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "認証が必要です" }, { status: 401 });
    }

    let userId: number;
    try {
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
      userId = payload.userId as number; // JWTからuserIdを抽出
    } catch (jwtError) {
      console.error("JWT検証エラー:", jwtError);
      return NextResponse.json({ success: false, message: "無効な認証トークンです" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month"); // 月は1から12の数値

    if (!year || !month) {
      return NextResponse.json(
        { success: false, message: "year と month が必要です。" },
        { status: 400 }
      );
    }

    const yearNum = Number(year);
    const monthNum = Number(month);
    if (
      !Number.isInteger(yearNum) ||
      !Number.isInteger(monthNum) ||
      monthNum < 1 ||
      monthNum > 12
    ) {
      return NextResponse.json(
        { success: false, message: "year / month の形式が不正です。" },
        { status: 400 }
      );
    }

    const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(yearNum, monthNum, 1)); // 翌月の1日（12月も自動で翌年1月になる）

    const startOfMonth = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const endOfMonth = endDate.toISOString().slice(0, 10); // YYYY-MM-DD

    let query = supabase.from("mt_tasks").select("*");

    if (userId !== 1) { // userId が 1 ではない場合のみフィルタリング
      query = query.eq("users_id", userId)
        .eq("created_by", userId);
    }

    query = query.gte("task_date", startOfMonth) // 月の開始日以上
      .lt("task_date", endOfMonth); // 次の月の1日より小さい

    const users_id = searchParams.get("users_id");
    if (users_id) {
      query = query.eq("users_id", users_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, tasks: data }, { status: 200 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { task_date, task_name, users_id, note } = await req.json();

    if (!task_date || !task_name) {
      return NextResponse.json(
        { success: false, message: "日付とタスク内容が必要です" },
        { status: 400 }
      );
    }

    // mt_tasks テーブル構成に合わせる
    const newTaskId = Math.floor(Math.random() * 1_000_000_000); // id numeric not null のため一時的に生成

    const { data, error } = await supabase
      .from("mt_tasks") // テーブル名を mt_tasks に変更
      .insert([
        {
          id: newTaskId,
          task_name: task_name,
          status: 0, // 初期ステータス
          users_id: users_id || null,
          task_date: task_date,
          note: note || null,
          // created_at, updated_at はDBのデフォルト値に任せる
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, task: data[0] }, { status: 201 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, task_name, note, users_id } = await req.json();

    if (!id || !task_name) {
      return NextResponse.json(
        { success: false, message: "IDとタスク内容が必要です" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("mt_tasks")
      .update({ task_name, note: note || null, users_id: users_id || null })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, task: data[0] }, { status: 200 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "タスクIDが必要です。" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("mt_tasks").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "タスクが正常に削除されました。" }, { status: 200 });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json(
      { success: false, message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
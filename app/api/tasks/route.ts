import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month"); // 月は1から12の数値

    if (!year || !month) {
      return NextResponse.json(
        { success: false, message: "year と month が必要です。" },
        { status: 400 }
      );
    }

    const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
    const endOfMonth = `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`; // 次の月の1日を使って範囲を指定

    let query = supabase.from("mt_tasks").select("*")
      .gte("task_date", startOfMonth)
      .lt("task_date", endOfMonth); // 次の月の1日より小さい日付

    const users_id = searchParams.get("users_id");
    if (users_id) {
      query = query.eq("users_id", users_id);
    }

    const { data, error } = await query;
    console.log("data", data);
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
    const { task_date, task_name, users_id } = await req.json();

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
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
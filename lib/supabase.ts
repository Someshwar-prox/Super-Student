import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SessionRecord {
  id?: string;
  session_code: string;
  subject_id: string;
  subject_name: string;
  period: number;
  otp?: string;
  otp_expiry?: number;
  teacher_location?: { lat: number; lng: number };
  active: boolean;
  created_at?: string;
}

// Store session in Supabase
export async function storeSessionInSupabase(
  sessionData: SessionRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("attendance_sessions").upsert({
      session_code: sessionData.session_code,
      subject_id: sessionData.subject_id,
      subject_name: sessionData.subject_name,
      period: sessionData.period,
      otp: sessionData.otp,
      otp_expiry: sessionData.otp_expiry,
      teacher_location: sessionData.teacher_location,
      active: sessionData.active,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to store session:", err);
    return { success: false, error: "Failed to store session" };
  }
}

// Get session from Supabase by code
export async function getSessionFromSupabase(
  sessionCode: string
): Promise<{ success: boolean; session?: SessionRecord; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("*")
      .eq("session_code", sessionCode)
      .eq("active", true)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Session not found or expired" };
    }

    // Check if session is expired (8 hours)
    const createdAt = new Date(data.created_at).getTime();
    const SESSION_DURATION = 8 * 60 * 60 * 1000;
    if (Date.now() - createdAt > SESSION_DURATION) {
      // Deactivate expired session
      await supabase
        .from("attendance_sessions")
        .update({ active: false })
        .eq("session_code", sessionCode);
      return { success: false, error: "Session has expired" };
    }

    return {
      success: true,
      session: {
        id: data.id,
        session_code: data.session_code,
        subject_id: data.subject_id,
        subject_name: data.subject_name,
        period: data.period,
        otp: data.otp,
        otp_expiry: data.otp_expiry,
        teacher_location: data.teacher_location,
        active: data.active,
        created_at: data.created_at,
      },
    };
  } catch (err) {
    console.error("Failed to get session:", err);
    return { success: false, error: "Failed to retrieve session" };
  }
}

// End session in Supabase
export async function endSessionInSupabase(
  sessionCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendance_sessions")
      .update({ active: false })
      .eq("session_code", sessionCode);

    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to end session:", err);
    return { success: false, error: "Failed to end session" };
  }
}

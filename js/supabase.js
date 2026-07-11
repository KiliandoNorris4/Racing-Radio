import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================
   SUPABASE
========================================== */

const SUPABASE_URL = "https://ugyjydxtsyuawgdrxeug.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* ==========================================
   STREAMS LADEN
========================================== */

export async function getStreams() {

    const { data, error } = await supabase
        .from("streams")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if (error) {

        console.error(error);

        throw error;

    }

    return data ?? [];

}

/* ==========================================
   STREAM HINZUFÜGEN
========================================== */

export async function addStream(stream) {

    const { error } = await supabase
        .from("streams")
        .insert([stream]);

    if (error) {

        console.error(error);

        throw error;

    }

}

/* ==========================================
   STREAM BEARBEITEN
========================================== */

export async function updateStream(id, stream) {

    const { error } = await supabase
        .from("streams")
        .update(stream)
        .eq("id", id);

    if (error) {

        console.error(error);

        throw error;

    }

}

/* ==========================================
   STREAM LÖSCHEN
========================================== */

export async function deleteStream(id) {

    const { error } = await supabase
        .from("streams")
        .delete()
        .eq("id", id);

    if (error) {

        console.error(error);

        throw error;

    }

}
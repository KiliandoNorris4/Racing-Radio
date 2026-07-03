/* ===================================
   TRACKTIME V2
   SUPABASE
=================================== */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://ugyjydxtsyuawgdrxeug.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVneWp5ZHh0c3l1YXdnZHJ4ZXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjQyMDgsImV4cCI6MjA5NzIwMDIwOH0.9Mt-Iz1T-HNTCCAj65AxGJt9eqHq6Y9VXNZJedCFWR4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

import { supabase } from "./supabase.js";

export async function getStreams() {

    const { data, error } = await supabase
        .from("streams")
        .select("*");

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

/* ===================================
   SONGS
=================================== */

async function getSongs() {

    const { data, error } = await supabaseClient
        .from("songs")
        .select("*")
        .order("likes", { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

async function addSong(viewer, song, artist) {

    const { error } = await supabaseClient
        .from("songs")
        .insert([
            {
                viewer,
                song,
                artist,
                likes: 0
            }
        ]);

    if (error)
        throw error;
}

async function likeSong(id, likes) {

    const { error } = await supabaseClient
        .from("songs")
        .update({
            likes: likes + 1
        })
        .eq("id", id);

    if (error)
        console.error(error);
}

/* ===================================
   STREAMS
=================================== */

async function getStreams() {

    const { data, error } = await supabaseClient
        .from("streams")
        .select("*")
        .order("date");

    if (error) {

        console.error(error);

        return [];
    }

    return data;
}

async function addStream(title, date, time, description = "") {

    const { error } = await supabaseClient
        .from("streams")
        .insert([
            {
                title,
                date,
                time,
                description
            }
        ]);

    if (error)
        throw error;
}

async function deleteStream(id) {

    const { error } = await supabaseClient
        .from("streams")
        .delete()
        .eq("id", id);

    if (error)
        console.error(error);
}

/* ===================================
   TEAM
=================================== */

async function getTeam() {

    const { data, error } = await supabaseClient
        .from("team")
        .select("*")
        .order("name");

    if (error) {

        console.error(error);

        return [];
    }

    return data;
}

async function addMember(member) {

    const { error } = await supabaseClient
        .from("team")
        .insert([member]);

    if (error)
        throw error;
}

async function deleteMember(id) {

    const { error } = await supabaseClient
        .from("team")
        .delete()
        .eq("id", id);

    if (error)
        console.error(error);
}
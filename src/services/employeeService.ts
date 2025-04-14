
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";

export async function updateEmployeeProfile(id: string, updates: Partial<Employee>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      email: updates.email,
      role: updates.role,
      status: updates.status,
      telegram: updates.telegram,
      pending_telegram: updates.pendingTelegram,
      department: updates.department,
      profile_image: updates.profileImage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEmployeeProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      team_assignments(
        teams(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function listEmployees() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      team_assignments(
        teams(*)
      )
    `)
    .order('name');

  if (error) throw error;
  return data;
}

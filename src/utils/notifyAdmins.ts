import { supabase } from '@/integrations/supabase/client';

/**
 * Notify all admin users about a quest submission.
 * Inserts a notification row for each admin.
 */
export const notifyAdminsOfQuestSubmission = async (
  submitterName: string,
  questTitle: string,
  questType: 'daily' | 'weekly' | 'monthly'
) => {
  try {
    // Fetch all admin user IDs
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .or("role.eq.Admin,roles.cs.{Admin}");

    if (adminError || !admins || admins.length === 0) {
      console.error('Error fetching admins for notification:', adminError);
      return;
    }

    const typeLabel = questType === 'monthly' ? 'Special Ops' : questType.charAt(0).toUpperCase() + questType.slice(1);

    const notifications = admins.map(admin => ({
      recipient_id: admin.id,
      type: 'quest_submission',
      title: `${typeLabel} Quest Submitted`,
      message: `${submitterName} submitted "${questTitle}" for review.`,
      read: false,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error inserting quest notifications:', error);
    }
  } catch (err) {
    console.error('Error in notifyAdminsOfQuestSubmission:', err);
  }
};

import { supabase } from '@/lib/supabaseClient';

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const isAuthenticated = async () => {
  const session = await getSession();
  return !!session?.user;
};

export const me = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
  return { ...user, ...profile, name: profile?.full_name || user.email };
};

/**
 * @param {Record<string, any>} updates
 */
export const updateMe = async (updates) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const logout = () => supabase.auth.signOut();

// ─── USERS ───────────────────────────────────────────────────────────────────

export const listUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
};

export const filterUsers = async (filters = {}, sort = null, limit = null) => {
  let query = supabase.from('users').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createUser = async (payload) => {
  const { data, error } = await supabase.from('users').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const getUserProfile = async (email) => {
  const { data } = await supabase.from('users').select('*').eq('email', email).single();
  return data;
};

export const updateUserProfile = async (email, updates) => {
  const { data } = await supabase.from('users').update(updates).eq('email', email).select().single();
  return data;
};

// ─── GLUCOSE LOGS ────────────────────────────────────────────────────────────

export const createGlucoseLog = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('glucose_logs')
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getGlucoseLogs = async (email, limit = 50) => {
  const { data, error } = await supabase
    .from('glucose_logs')
    .select('*')
    .eq('user_email', email)
    .order('log_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const filterGlucoseLogs = async (filters = {}, sort = '-log_date', limit = 50) => {
  let query = supabase.from('glucose_logs').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ─── INSULIN LOGS ────────────────────────────────────────────────────────────

export const createInsulinLog = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('insulin_logs')
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getInsulinLogs = async (email, limit = 20) => {
  const { data, error } = await supabase
    .from('insulin_logs')
    .select('*')
    .eq('user_email', email)
    .order('log_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const filterInsulinLogs = async (filters = {}, sort = '-log_date', limit = 20) => {
  let query = supabase.from('insulin_logs').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ─── MEAL LOGS ───────────────────────────────────────────────────────────────

export const createMealLog = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMealLogs = async (email, limit = 20) => {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_email', email)
    .order('log_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const filterMealLogs = async (filters = {}, sort = '-log_date', limit = 20) => {
  let query = supabase.from('meal_logs').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ─── PARENT REMINDERS ────────────────────────────────────────────────────────

export const createReminder = async (payload) => {
  const { data, error } = await supabase.from('parent_reminders').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const getReminders = async (toEmail, limit = 20) => {
  const { data, error } = await supabase
    .from('parent_reminders')
    .select('*')
    .eq('to_email', toEmail)
    .order('sent_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

export const filterParentReminders = async (filters = {}, sort = '-sent_at', limit = 20) => {
  let query = supabase.from('parent_reminders').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateParentReminder = async (id, updates) => {
  const { data, error } = await supabase
    .from('parent_reminders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const markReminderRead = async (id) => {
  const { error } = await supabase.from('parent_reminders').update({ is_read: true }).eq('id', id);
  if (error) throw error;
};

// ─── CHAT MESSAGES ───────────────────────────────────────────────────────────

export const sendMessage = async (payload) => {
  const { data, error } = await supabase.from('chat_messages').insert(payload).select().single();
  if (error) throw error;
  return data;
};

export const getMessages = async (myEmail, otherEmail) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(
      `and(from_email.eq.${myEmail},to_email.eq.${otherEmail}),and(from_email.eq.${otherEmail},to_email.eq.${myEmail})`
    )
    .order('sent_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const filterChatMessages = async (filters = {}, sort = '-sent_at', limit = 500) => {
  let query = supabase.from('chat_messages').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const markMessageRead = async (id) => {
  const { error } = await supabase.from('chat_messages').update({ is_read: true }).eq('id', id);
  if (error) throw error;
};

// ─── MEDICAL DOCUMENTS ───────────────────────────────────────────────────────

export const uploadDocument = async (file, userEmail, documentType, notes = '') => {
  const filePath = `${userEmail}/${Date.now()}_${file.name}`;
  const { data: storageData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storageData.path);

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('medical_documents').insert({
    user_email: userEmail,
    user_id: user?.id,
    file_url: publicUrl,
    file_name: file.name,
    document_type: documentType,
    notes,
    upload_date: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
};

export const getDocuments = async (email) => {
  const { data, error } = await supabase
    .from('medical_documents')
    .select('*')
    .eq('user_email', email)
    .order('upload_date', { ascending: false });
  if (error) throw error;
  return data;
};

export const filterMedicalDocuments = async (filters = {}, sort = '-upload_date', limit = 50) => {
  let query = supabase.from('medical_documents').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const deleteDocument = async (id) => {
  const { error } = await supabase.from('medical_documents').delete().eq('id', id);
  if (error) throw error;
};

export const uploadFile = async ({ file }) => {
  const filePath = `uploads/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(data.path);
  return { file_url: publicUrl, path: data.path };
};

// ─── REWARDS ─────────────────────────────────────────────────────────────────

export const createReward = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('rewards')
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRewards = async (email) => {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('user_email', email)
    .order('earned_date', { ascending: false });
  if (error) throw error;
  return data;
};

// ─── REMINDERS (child self-reminders) ────────────────────────────────────────

export const createSelfReminder = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('reminders')
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getSelfReminders = async (email) => {
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_email', email);
  if (error) throw error;
  return data;
};

export const filterReminders = async (filters = {}, sort = '-created_at', limit = 50) => {
  let query = supabase.from('reminders').select('*');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });
  if (sort) {
    const desc = sort.startsWith('-');
    const col = desc ? sort.slice(1) : sort;
    query = query.order(col, { ascending: !desc });
  }
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateSelfReminder = async (id, updates) => {
  const { error } = await supabase.from('reminders').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteSelfReminder = async (id) => {
  const { error } = await supabase.from('reminders').delete().eq('id', id);
  if (error) throw error;
};
export const navigateToLogin = () => {
  window.location.href = "/Landing";
};

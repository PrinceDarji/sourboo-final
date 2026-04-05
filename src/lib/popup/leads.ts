import { getSupabaseAdminClient } from '@/src/lib/supabase/admin';

export type PopupLeadInsertInput = {
  email: string;
  phone: string;
  selectedOptionLabel: string;
  selectedOptionHref?: string;
  sourcePath?: string;
};

function toPopupLeadInsertError(message: string, details?: unknown): Error {
  const context = details ? ` ${JSON.stringify(details)}` : '';
  return new Error(`${message}${context}`);
}

export async function createPopupLead(input: PopupLeadInsertInput): Promise<void> {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('popup_leads').insert({
    email: input.email,
    phone: input.phone,
    selected_option_label: input.selectedOptionLabel,
    selected_option_href: input.selectedOptionHref || null,
    source_path: input.sourcePath || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw toPopupLeadInsertError('Failed to create popup lead.', error);
  }
}

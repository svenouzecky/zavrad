import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
	process.env.NEXT_PUBLIC_PUBLIC_URL!,
	process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!
);

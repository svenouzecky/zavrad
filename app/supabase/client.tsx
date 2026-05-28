import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
	process.env.NEXT_PUBLIC_PUBLIC_URL!,
	process.env.NEXT_PUBLIC_PUBLISHABLE_KEY!
);

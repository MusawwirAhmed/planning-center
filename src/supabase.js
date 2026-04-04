import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pcojblzucxznfgvbbyqa.supabase.co'
const SUPABASE_KEY = 'sb_publishable_KCHKcBMIRJPwn6IKFoj8kg_ATl024Nq'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

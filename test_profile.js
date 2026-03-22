import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function test() {
  const { data, error } = await supabase.from('profiles').select('id, city').eq('id', 'd7b54d59-d309-409b-b2d8-dfc5028b7f09')
  console.log(JSON.stringify({ data, error }, null, 2))
}
test()

// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://qodwiyuoqllxrxvcwfvl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvZHdpeXVvcWxseHJ4dmN3ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNDg5NTUsImV4cCI6MjA0NzYyNDk1NX0.rXVRDtq44M1HdJvKLbUJ3Gn0GoIJf4DM-YHag58aIgY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
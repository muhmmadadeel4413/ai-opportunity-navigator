export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      opportunities: {
        Row: {
          application_deadline: string | null
          compensation: string | null
          created_at: string | null
          description: string
          duration: string | null
          education_requirements: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          location: string | null
          opportunity_type: string
          organization: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          application_deadline?: string | null
          compensation?: string | null
          created_at?: string | null
          description: string
          duration?: string | null
          education_requirements?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          opportunity_type: string
          organization: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          application_deadline?: string | null
          compensation?: string | null
          created_at?: string | null
          description?: string
          duration?: string | null
          education_requirements?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          location?: string | null
          opportunity_type?: string
          organization?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
      }
      profiles: {
        Row: {
          career_goals: string | null
          created_at: string | null
          education_level: string | null
          email: string
          full_name: string | null
          gpa: string | null
          graduation_year: number | null
          id: string
          interests: string[] | null
          location_preference: string | null
          major: string | null
          onboarding_complete: boolean | null
          preferred_industry: string | null
          profile_embedding: string | null
          resume_parsed: Json | null
          resume_text: string | null
          soft_skills: string[] | null
          technical_skills: string[] | null
          university: string | null
          updated_at: string | null
        }
        Insert: {
          career_goals?: string | null
          created_at?: string | null
          education_level?: string | null
          email: string
          full_name?: string | null
          gpa?: string | null
          graduation_year?: number | null
          id: string
          interests?: string[] | null
          location_preference?: string | null
          major?: string | null
          onboarding_complete?: boolean | null
          preferred_industry?: string | null
          profile_embedding?: string | null
          resume_parsed?: Json | null
          resume_text?: string | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          university?: string | null
          updated_at?: string | null
        }
        Update: {
          career_goals?: string | null
          created_at?: string | null
          education_level?: string | null
          email?: string
          full_name?: string | null
          gpa?: string | null
          graduation_year?: number | null
          id?: string
          interests?: string[] | null
          location_preference?: string | null
          major?: string | null
          onboarding_complete?: boolean | null
          preferred_industry?: string | null
          profile_embedding?: string | null
          resume_parsed?: Json | null
          resume_text?: string | null
          soft_skills?: string[] | null
          technical_skills?: string[] | null
          university?: string | null
          updated_at?: string | null
        }
      }
      saved_opportunities: {
        Row: {
          ai_explanation: string | null
          id: string
          match_score: number | null
          opportunity_id: string
          saved_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_explanation?: string | null
          id?: string
          match_score?: number | null
          opportunity_id: string
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_explanation?: string | null
          id?: string
          match_score?: number | null
          opportunity_id?: string
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
      }
    }
    Functions: {
      match_opportunities_by_embedding: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          application_deadline: string
          compensation: string
          created_at: string
          description: string
          duration: string
          education_requirements: string
          embedding: string
          id: string
          is_active: boolean
          is_remote: boolean
          location: string
          opportunity_type: string
          organization: string
          preferred_skills: string[]
          required_skills: string[]
          similarity: number
          tags: string[]
          title: string
          updated_at: string
          url: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

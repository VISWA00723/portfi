export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at?: string;
          email: string;
          name?: string;
          role: 'user' | 'admin';
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          name?: string;
          role?: 'user' | 'admin';
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          name?: string;
          role?: 'user' | 'admin';
        };
      };
    };
  };
};

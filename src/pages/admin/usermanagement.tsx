import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2,
  Shield,
  User,
  RefreshCcw,
  Ban,
  CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AppUser = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  is_suspended: boolean;
  created_at: string;
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Failed to load users', variant: 'destructive' });
    } else {
      setUsers(data as AppUser[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleSuspend = async (user: AppUser) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: !user.is_suspended })
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Failed to update user', variant: 'destructive' });
    } else {
      toast({
        title: user.is_suspended
          ? 'User activated'
          : 'User suspended',
      });
      fetchUsers();
    }
  };

  const deleteUser = async (user: AppUser) => {
    if (!confirm(`Delete ${user.email}? This action is irreversible.`)) return;

    const { error } = await supabase.rpc('delete_user_admin', {
      user_id: user.id,
    });

    if (error) {
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    } else {
      toast({ title: 'User deleted successfully' });
      fetchUsers();
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast({
        title: 'Failed to send reset email',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Password reset email sent' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-muted-foreground">
          {users.length} total users
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-4 space-y-4"
          >
            {/* User Info */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {user.role === 'admin' ? (
                  <Shield className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {(user.role ?? 'user').toUpperCase()}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {user.is_suspended ? (
                  <Ban className="w-4 h-4 text-destructive" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
                <span className="text-muted-foreground">
                  {user.is_suspended ? 'Suspended' : 'Active'}
                </span>
              </div>

              <Switch
                checked={!user.is_suspended}
                onCheckedChange={() => toggleSuspend(user)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => resetPassword(user.email)}
              >
                <RefreshCcw className="w-4 h-4" />
                Reset Password
              </Button>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => deleteUser(user)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserManagement;

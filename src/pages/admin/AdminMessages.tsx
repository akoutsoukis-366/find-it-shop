import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, MailOpen, Trash2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read })
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => msg.id === id ? { ...msg, read } : msg)
      );
      toast.success(read ? 'Marked as read' : 'Marked as unread');
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const viewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id, true);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">
              View and manage customer inquiries
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No messages yet</h3>
            <p className="text-muted-foreground">
              Customer messages will appear here
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.tr
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b transition-colors hover:bg-muted/50 ${
                        !message.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <TableCell>
                        {message.read ? (
                          <MailOpen className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.message}
                      </TableCell>
                      <TableCell>
                        {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewMessage(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(message.id, !message.read)}
                          >
                            {message.read ? (
                              <Mail className="h-4 w-4" />
                            ) : (
                              <MailOpen className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{selectedMessage.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <p className="text-foreground">
                  {format(new Date(selectedMessage.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <p className="text-foreground whitespace-pre-wrap mt-1 p-4 bg-muted rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}`;
                  }}
                >
                  Reply via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;

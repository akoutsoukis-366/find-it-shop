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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, CheckCheck, Check, AlertTriangle, Clock, MailX } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface MessageReply {
  id: string;
  message_id: string;
  subject: string;
  body: string;
  recipient_email: string;
  status: string;
  error: string | null;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; className?: string }> = {
  sent: { label: 'Στάλθηκε', variant: 'secondary', icon: Check },
  delivered: { label: 'Παραδόθηκε', variant: 'default', icon: CheckCheck, className: 'bg-green-600 hover:bg-green-600 text-white' },
  opened: { label: 'Ανοίχτηκε', variant: 'default', icon: CheckCheck, className: 'bg-green-600 hover:bg-green-600 text-white' },
  clicked: { label: 'Πατήθηκε σύνδεσμος', variant: 'default', icon: CheckCheck, className: 'bg-green-600 hover:bg-green-600 text-white' },
  delayed: { label: 'Καθυστέρηση', variant: 'outline', icon: Clock },
  bounced: { label: 'Επέστρεψε (bounce)', variant: 'destructive', icon: MailX },
  complained: { label: 'Καταγγελία spam', variant: 'destructive', icon: AlertTriangle },
  failed: { label: 'Αποτυχία', variant: 'destructive', icon: AlertTriangle },
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [replies, setReplies] = useState<MessageReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

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

  const fetchReplies = async (messageId: string) => {
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('message_replies')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setReplies(data || []);
    } catch (e) {
      console.error('Failed to load replies', e);
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (!selectedMessage) {
      setReplies([]);
      return;
    }
    fetchReplies(selectedMessage.id);
    const channel = supabase
      .channel(`message_replies_${selectedMessage.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_replies', filter: `message_id=eq.${selectedMessage.id}` },
        () => fetchReplies(selectedMessage.id),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedMessage?.id]);

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
    setReplySubject(`Re: Μήνυμα από ${message.name}`);
    setReplyBody('');
    if (!message.read) {
      await markAsRead(message.id, true);
    }
  };

  const sendReply = async () => {
    if (!selectedMessage) return;
    if (!replyBody.trim()) {
      toast.error('Γράψτε ένα μήνυμα');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-message-reply', {
        body: {
          messageId: selectedMessage.id,
          subject: replySubject,
          replyBody,
        },
      });
      if (error) throw error;
      toast.success(`Η απάντηση στάλθηκε στο ${selectedMessage.email}`);
      setReplyBody('');
      fetchReplies(selectedMessage.id);
    } catch (err) {
      console.error('Reply error:', err);
      toast.error('Αποτυχία αποστολής απάντησης');
    } finally {
      setSending(false);
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Ιστορικό απαντήσεων {replies.length > 0 && `(${replies.length})`}
                </h3>
                {loadingReplies ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Φόρτωση...
                  </div>
                ) : replies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Δεν έχει σταλεί ακόμα καμία απάντηση.</p>
                ) : (
                  <div className="space-y-3">
                    {replies.map((r) => {
                      const meta = STATUS_META[r.status] || { label: r.status, variant: 'outline' as const, icon: Clock };
                      const Icon = meta.icon;
                      return (
                        <div key={r.id} className="p-3 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{r.subject}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(r.created_at), 'd MMM yyyy, HH:mm')} → {r.recipient_email}
                              </p>
                            </div>
                            <Badge variant={meta.variant} className={meta.className}>
                              <Icon className="h-3 w-3 mr-1" />
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{r.body}</p>
                          {r.error && (
                            <p className="text-xs text-destructive mt-2">{r.error}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Απάντηση</h3>
                <div className="space-y-2">
                  <Label htmlFor="reply-subject">Θέμα</Label>
                  <Input
                    id="reply-subject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    maxLength={200}
                    disabled={sending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-body">Μήνυμα</Label>
                  <Textarea
                    id="reply-body"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={8}
                    placeholder={`Γεια σας ${selectedMessage.name},`}
                    maxLength={10000}
                    disabled={sending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Θα σταλεί από support@metavex.gr στο {selectedMessage.email}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMessage(null)}
                    disabled={sending}
                  >
                    Ακύρωση
                  </Button>
                  <Button onClick={sendReply} disabled={sending || !replyBody.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Αποστολή
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;

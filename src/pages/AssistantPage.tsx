import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Scale,
  BookOpen,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  History,
  Trash2,
  X,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { LawArticle } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  articles?: LawArticle[];
  lawTitle?: string;
  isError?: boolean;
}

interface Conversation {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  matched_articles?: Array<{
    id: string;
    number: string;
    title?: string | null;
  }> | null;
  rating?: number | null;
  status?: string | null;
  created_at: string;
}

const SUGGESTED_QUESTIONS = [
  'ما هي أركان عقد الزواج؟',
  'ما هي حقوق العامل في قانون العمل؟',
  'ما هي مصادر الالتزام في القانون المدني؟',
  'ما هو مبدأ الشرعية في الجنايات؟',
];

export function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);

  // ==============================
  // Scroll to latest message
  // ==============================
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  // ==============================
  // Load previous conversations
  // ==============================
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    setHistoryLoading(true);

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      setConversations((data || []) as Conversation[]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ==============================
  // Call AI
  // ==============================
  const callAI = async (question: string) => {
    const apiUrl =
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
      headers['Authorization'] =
        `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
    }

    let response: Response;

    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ question }),
      });
    } catch {
      throw new Error(
        'تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.'
      );
    }

    let data: {
      answer?: string;
      articles?: LawArticle[];
      lawTitle?: string;
      error?: string;
    };

    try {
      data = await response.json();
    } catch {
      throw new Error(
        'استجابة غير صالحة من الخادم. يرجى المحاولة مرة أخرى.'
      );
    }

    if (!response.ok || data.error) {
      throw new Error(
        data.error ||
          `حدث خطأ في الخادم (${response.status}). يرجى المحاولة مرة أخرى.`
      );
    }

    const answer = data.answer;

    if (
      !answer ||
      typeof answer !== 'string' ||
      answer.trim().length === 0
    ) {
      throw new Error(
        'لم يتم استلام إجابة صالحة. يرجى المحاولة مرة أخرى.'
      );
    }

    return {
      answer,
      articles: Array.isArray(data.articles) ? data.articles : [],
      lawTitle:
        typeof data.lawTitle === 'string'
          ? data.lawTitle
          : '',
    };
  };

  // ==============================
  // Send question
  // ==============================
  const handleSend = async (question?: string) => {
    const q = question || input.trim();

    if (!q || loading) return;

    setInput('');

    setMessages((m) => [
      ...m,
      {
        role: 'user',
        content: q,
      },
    ]);

    setLoading(true);

    try {
      const { answer, articles, lawTitle } = await callAI(q);

      // Save conversation
      if (user) {
        const matchedArticles = articles.map((a) => ({
          id: a.id,
          number: a.article_number,
          title: a.title,
        }));

        const { data: savedConversation, error } = await supabase
          .from('ai_conversations')
          .insert({
            user_id: user.id,
            question: q,
            answer,
            matched_articles: matchedArticles,
          })
          .select('*')
          .single();

        if (error) {
          console.error(
            'Error saving conversation:',
            error
          );
        }

        // Add the new conversation immediately to history
        if (savedConversation) {
          setConversations((prev) => [
            savedConversation as Conversation,
            ...prev,
          ]);
        }
      }

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: answer,
          articles,
          lawTitle,
        },
      ]);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: errorMsg,
          isError: true,
        },
      ]);

      toast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Open previous conversation
  // ==============================
  const openConversation = (
    conversation: Conversation
  ) => {
   const articles: LawArticle[] = Array.isArray(
  conversation.matched_articles
)
  ? conversation.matched_articles.map((article) => ({
      id: article.id,
      article_number: article.number,
      title: article.title || null,
      content: '',
      law_id: '',
      created_at: conversation.created_at,
      updated_at: conversation.created_at,
    }))
  : [];

    setMessages([
      {
        role: 'user',
        content: conversation.question,
      },
      {
        role: 'assistant',
        content: conversation.answer,
        articles,
      },
    ]);

    setHistoryOpen(false);
  };

  // ==============================
  // New conversation
  // ==============================
  const handleNewConversation = () => {
    setMessages([]);
    setInput('');
    setHistoryOpen(false);
  };

  // ==============================
  // Delete conversation
  // ==============================
  const deleteConversation = async (
    id: string
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error(
        'Error deleting conversation:',
        error
      );

      toast(
        'تعذر حذف المحادثة',
        'error'
      );

      return;
    }

    setConversations((prev) =>
      prev.filter((conversation) => conversation.id !== id)
    );

    toast(
      'تم حذف المحادثة',
      'success'
    );
  };

  // ==============================
  // Rating
  // ==============================
  const handleRating = async (
    messageIndex: number,
    rating: number
  ) => {
    if (!user) return;

    const msg = messages[messageIndex];

    if (
      msg.role !== 'assistant' ||
      msg.isError
    ) {
      return;
    }

    const question =
      messages[messageIndex - 1]?.content || '';

    const { data } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', user.id)
      .eq('question', question)
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (data) {
      await supabase
        .from('ai_conversations')
        .update({ rating })
        .eq(
          'id',
          (data as { id: string }).id
        );

      toast(
        'شكراً لتقييمك!',
        'success'
      );
    }
  };

  // ==============================
  // Format date
  // ==============================
  const formatDate = (
    date: string
  ) => {
    try {
      return new Intl.DateTimeFormat(
        'ar-YE',
        {
          day: 'numeric',
          month: 'short',
          hour: 'numeric',
          minute: '2-digit',
        }
      ).format(new Date(date));
    } catch {
      return '';
    }
  };

  return (
    <div className="container-page section-padding py-8">
      <div className="max-w-4xl mx-auto">

        {/* ========================= */}
        {/* Header */}
        {/* ========================= */}

        <div className="mb-6 text-center relative">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-500 to-navy-700 mb-3">
            <Bot className="w-7 h-7 text-gold-400" />
          </div>

          <div className="flex items-center justify-center gap-2">

            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              المساعد القانوني الذكي
            </h1>

            {/* History Button */}
            {user && (
              <button
                type="button"
                onClick={() =>
                  setHistoryOpen((value) => !value)
                }
                className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl text-navy-500 dark:text-navy-300 hover:text-gold-500 hover:bg-navy-100 dark:hover:bg-navy-800 transition-all"
                aria-label="المحادثات السابقة"
                title="المحادثات السابقة"
              >
                <History className="w-5 h-5" />

                {conversations.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gold-500 text-navy-900 text-[9px] font-bold flex items-center justify-center">
                    {conversations.length > 99
                      ? '99+'
                      : conversations.length}
                  </span>
                )}
              </button>
            )}

            {/* History Popup */}
            {historyOpen && user && (
              <>
                {/* Background click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() =>
                    setHistoryOpen(false)
                  }
                />

                <div
                  className="absolute z-50 top-24 left-1/2 -translate-x-1/2 w-[330px] max-w-[calc(100vw-32px)] rounded-2xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-elevated text-right overflow-hidden"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  {/* Popup Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-800">

                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-gold-500" />

                      <span className="text-sm font-semibold text-navy-900 dark:text-white">
                        المحادثات السابقة
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setHistoryOpen(false)
                      }
                      className="p-1.5 rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
                      aria-label="إغلاق"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* New Conversation */}
                  <div className="p-3 border-b border-navy-100 dark:border-navy-800">

                    <button
                      type="button"
                      onClick={
                        handleNewConversation
                      }
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-900 text-sm font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      محادثة جديدة
                    </button>

                  </div>

                  {/* Conversations */}
                  <div className="max-h-[360px] overflow-y-auto">

                    {historyLoading ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="sm" />
                      </div>
                    ) : conversations.length === 0 ? (

                      <div className="px-4 py-8 text-center">
                        <History className="w-8 h-8 mx-auto text-navy-300 dark:text-navy-700 mb-2" />

                        <p className="text-sm text-navy-500 dark:text-navy-400">
                          لا توجد محادثات سابقة
                        </p>
                      </div>

                    ) : (

                      <div className="p-2 space-y-1">

                        {conversations.map(
                          (conversation) => (
                            <div
                              key={conversation.id}
                              className="group flex items-center gap-2 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-800/70 transition-colors"
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  openConversation(
                                    conversation
                                  )
                                }
                                className="flex-1 min-w-0 text-right px-3 py-2.5"
                              >

                                <div className="flex items-start gap-2">

                                  <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-gold-500" />

                                  <div className="min-w-0">

                                    <p className="text-sm font-medium text-navy-800 dark:text-navy-100 truncate">
                                      {conversation.question}
                                    </p>

                                    <p className="text-[11px] text-navy-400 mt-1">
                                      {formatDate(
                                        conversation.created_at
                                      )}
                                    </p>

                                  </div>

                                </div>

                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteConversation(
                                    conversation.id
                                  )
                                }
                                className="shrink-0 p-2 mr-1 rounded-lg text-navy-300 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="حذف المحادثة"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </>
            )}

          </div>

          <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
            اطرح سؤالك القانوني بالعربية وسأبحث في قاعدة بيانات القوانين اليمنية
          </p>

        </div>

        {/* ========================= */}
        {/* Suggested Questions */}
        {/* ========================= */}

        {messages.length === 0 && (
          <div className="card p-6 mb-4">

            <div className="flex items-center gap-2 mb-4">

              <Sparkles className="w-5 h-5 text-gold-500" />

              <h3 className="font-semibold text-navy-900 dark:text-navy-100">
                أسئلة مقترحة
              </h3>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

              {SUGGESTED_QUESTIONS.map(
                (q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() =>
                      handleSend(q)
                    }
                    className="text-right p-3 rounded-xl border border-navy-100 dark:border-navy-800 text-sm text-navy-700 dark:text-navy-300 hover:bg-royal-50 dark:hover:bg-royal-900/20 hover:border-royal-300 transition-all"
                  >
                    {q}
                  </button>
                )
              )}

            </div>
          </div>
        )}

        {/* ========================= */}
        {/* Messages */}
        {/* ========================= */}

        <div
          ref={scrollRef}
          className="card p-4 h-[500px] overflow-y-auto mb-4 space-y-4"
        >

          {messages.length === 0 &&
            !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center">

                <Scale className="w-16 h-16 text-navy-200 dark:text-navy-700 mb-4" />

                <p className="text-navy-400">
                  ابدأ بطرح سؤالك القانوني...
                </p>

              </div>
            )}

          {messages.map(
            (msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  msg.role === 'user'
                    ? 'flex-row-reverse'
                    : ''
                }`}
              >

                <div
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-royal-100 dark:bg-royal-900/30'
                      : 'bg-gradient-to-br from-royal-500 to-navy-700'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-royal-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-gold-400" />
                  )}
                </div>

                <div
                  className={`flex-1 max-w-[80%] ${
                    msg.role === 'user'
                      ? 'text-left'
                      : ''
                  }`}
                >

                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.isError
                        ? 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300'
                        : msg.role === 'user'
                        ? 'bg-royal-50 dark:bg-royal-900/20 text-navy-900 dark:text-navy-100'
                        : 'bg-navy-50 dark:bg-navy-800 text-navy-800 dark:text-navy-200'
                    }`}
                  >

                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {msg.content}
                    </p>

                  </div>

                  {msg.role === 'assistant' &&
                    !msg.isError &&
                    msg.articles &&
                    msg.articles.length > 0 && (

                      <div className="mt-2 space-y-1">

                        <div className="flex items-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleRating(i, 1)
                            }
                            className="p-1.5 rounded-lg hover:bg-success-50 dark:hover:bg-success-900/20 text-navy-400 hover:text-success-600 transition-colors"
                            aria-label="إجابة مفيدة"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRating(i, 2)
                            }
                            className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-navy-400 hover:text-error-600 transition-colors"
                            aria-label="إجابة غير مفيدة"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                        </div>

                        {msg.lawTitle && (
                          <div className="flex items-center gap-1.5 text-xs text-navy-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            {msg.lawTitle}
                          </div>
                        )}

                      </div>
                    )}

                </div>
              </div>
            )
          )}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3">

              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-royal-500 to-navy-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gold-400" />
              </div>

              <div className="flex items-center gap-2 bg-navy-50 dark:bg-navy-800 rounded-2xl px-4 py-3">

                <Spinner size="sm" />

                <span className="text-sm text-navy-500">
                  جارٍ البحث في القوانين...
                </span>

              </div>

            </div>
          )}

        </div>

        {/* ========================= */}
        {/* Input */}
        {/* ========================= */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >

          <input
            className="input flex-1"
            placeholder="اكتب سؤالك القانوني هنا..."
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            disabled={loading}
          />

          <Button
            type="submit"
            loading={loading}
            className="px-6"
          >
            <Send className="w-4 h-4" />
            إرسال
          </Button>

        </form>

      </div>
    </div>
  );
}
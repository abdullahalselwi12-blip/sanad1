import { useEffect, useState, useCallback } from 'react';
import { Image, FileText, Video, File, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import { formatFileSize, formatDate } from '@/utils';
import type { MediaItem, MediaType } from '@/types';

const typeIcons = { image: Image, pdf: FileText, video: Video, file: File };

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    setItems((data || []) as MediaItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const detectType = (file: File): MediaType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('video/')) return 'video';
    return 'file';
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const type = detectType(file);
      const path = `media/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file);
      if (uploadError) { toast(`فشل رفع ${file.name}`, 'error'); continue; }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      const { error } = await supabase.from('media').insert({ type, name: file.name, url: publicUrl, size: file.size, mime_type: file.type });
      if (error) { toast(`فشل حفظ ${file.name}`, 'error'); continue; }
    }
    setUploading(false);
    toast('تم رفع الملفات', 'success');
    load();
  };

  const handleDelete = async (item: MediaItem) => {
    const { error } = await supabase.from('media').delete().eq('id', item.id);
    if (error) { toast('حدث خطأ', 'error'); return; }
    toast('تم حذف الملف', 'success');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">مكتبة الوسائط</h1>
        <label className="cursor-pointer">
          <Button loading={uploading} className="pointer-events-none"><Upload className="w-4 h-4" /> رفع ملفات</Button>
          <input type="file" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Image className="w-12 h-12" />} title="لا توجد وسائط" description="ارفع أول ملف لبدء مكتبة الوسائط" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <div key={item.id} className="card overflow-hidden group">
                <div className="aspect-square bg-navy-50 dark:bg-navy-800 flex items-center justify-center relative">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-12 h-12 text-navy-300 dark:text-navy-600" />
                  )}
                  <button onClick={() => handleDelete(item)} className="absolute top-2 left-2 p-1.5 rounded-lg bg-error-600 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-navy-900 dark:text-navy-100 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="navy">{item.type}</Badge>
                    <span className="text-xs text-navy-400">{formatFileSize(item.size)}</span>
                  </div>
                  <p className="text-xs text-navy-400 mt-1">{formatDate(item.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Search, Scale, MapPin, Star, BadgeCheck, Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner, EmptyState } from '@/components/ui/Spinner';
import { supabase } from '@/lib/supabase';
import type { Lawyer } from '@/types';

export function LawyersPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('lawyers')
        .select('*, profile:profiles(*)')
        .eq('is_verified', true)
        .order('rating', { ascending: false });
      setLawyers((data || []) as Lawyer[]);
      setLoading(false);
    })();
  }, []);

  const filtered = lawyers.filter((l) => {
    if (!search) return true;
    const name = l.profile?.full_name || '';
    return name.includes(search) || (l.specialization || '').includes(search);
  });

  return (
    <div className="container-page section-padding py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">دليل المحامين</h1>
        <p className="text-navy-500 dark:text-navy-400">اعثر على محامين معتمدين متخصصين في مختلف المجالات القانونية</p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="ابحث بالاسم أو التخصص..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Scale className="w-16 h-16" />} title="لا يوجد محامون" description="لم نعثر على محامين مطابقين لبحثك" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lawyer) => (
            <div key={lawyer.id} className="card p-6 hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={lawyer.profile?.full_name} src={lawyer.profile?.avatar_url} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-navy-900 dark:text-navy-100 truncate">{lawyer.profile?.full_name}</h3>
                    {lawyer.is_verified && <BadgeCheck className="w-4 h-4 text-royal-500 shrink-0" />}
                  </div>
                  {lawyer.specialization && <p className="text-sm text-navy-500 dark:text-navy-400 mt-0.5">{lawyer.specialization}</p>}
                  {lawyer.rating ? (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                      <span className="text-xs text-navy-500">{Number(lawyer.rating).toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
              {lawyer.bio && <p className="text-sm text-navy-600 dark:text-navy-300 line-clamp-2 mb-4">{lawyer.bio}</p>}
              <div className="space-y-2 text-xs text-navy-500 dark:text-navy-400">
                {lawyer.experience_years && <p>سنوات الخبرة: {lawyer.experience_years}</p>}
                {lawyer.office_address && <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lawyer.office_address}</p>}
                {lawyer.license_number && <p className="flex items-center gap-1.5"><Badge variant="navy">رخصة: {lawyer.license_number}</Badge></p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

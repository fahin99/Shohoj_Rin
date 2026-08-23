import { useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { LoanCard } from '../components/LoanCard';
import { EmptyState, EmptyIcons } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { SearchInput, Select } from '../components/Input';
import { Tabs } from '../components/Tabs';
import { loanProducts } from '../lib/mock-data';
import type { PageName, LoanProduct } from '../types';
interface Props {
  onNavigate: (page: PageName) => void;
}
const categories: { id: string; label: string }[] = [
  { id: 'all', label: 'All categories' },
  { id: 'education', label: 'Education' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'business', label: 'Small business' },
  { id: 'personal', label: 'Personal' },
  { id: 'development', label: 'Development' },
];
const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'interest-asc', label: 'Interest rate: low to high' },
  { value: 'amount-desc', label: 'Max amount: high to low' },
  { value: 'tenure-asc', label: 'Tenure: shortest first' },
];
function sortLoans(loans: LoanProduct[], sort: string): LoanProduct[] {
  const list = [...loans];
  switch (sort) {
    case 'interest-asc':
      return list.sort((a, b) => a.interestRate - b.interestRate);
    case 'amount-desc':
      return list.sort((a, b) => b.maxAmount - a.maxAmount);
    case 'tenure-asc':
      return list.sort((a, b) => a.durationMonths - b.durationMonths);
    default:
      return list;
  }
}
const PAGE_SIZE = 6;
export default function LoanMarketplace({ onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategoryAndQuery = loanProducts.filter((loan) => {
      const matchesCategory = category === 'all' || loan.category === category;
      const matchesQuery =
        !q ||
        loan.name.toLowerCase().includes(q) ||
        loan.provider.toLowerCase().includes(q) ||
        loan.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
    return sortLoans(byCategoryAndQuery, sort);
  }, [query, category, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          title="Loan marketplace"
          description="Compare loan products from trusted lenders across Bangladesh and apply in minutes."
        />
        <div className="flex flex-col gap-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_14rem] gap-3">
            <SearchInput
              placeholder="Search by loan name or provider"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              onClear={() => { setQuery(''); setPage(1); }}
              aria-label="Search loan products"
            />
            <Select
              aria-label="Sort loan products"
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Tabs
              variant="pill"
              tabs={categories.map((c) => ({ id: c.id, label: c.label }))}
              activeTab={category}
              onChange={(id) => { setCategory(id); setPage(1); }}
            />
          </div>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          {filtered.length} loan{filtered.length === 1 ? '' : 's'} found
        </p>
        {pageItems.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.search}
            title="No loans match your filters"
            description="Try a different category or clear your search to see all available loan products."
            action={{ label: 'Clear filters', onClick: () => { setQuery(''); setCategory('all'); setSort('recommended'); setPage(1); } }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {pageItems.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onView={() => onNavigate('loan-details')}
                  onApply={() => onNavigate('loan-application')}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

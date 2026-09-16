"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { LoanCard } from "../components/LoanCard";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { SearchInput, Select } from "../components/Input";
import { Tabs } from "../components/Tabs";
import { loansApi } from "../lib/api/index";
import type { PageName, LoanProduct } from "../types";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

interface Props {
  onNavigate: (page: PageName) => void;
}

const categories = [
  { id: "all" },
  { id: "education" },
  { id: "emergency" },
  { id: "business" },
  { id: "personal" },
  { id: "development" },
];

const sortOptions = [
  { value: "recommended", labelKey: "marketplace.sortRecommended" },
  { value: "interest-asc", labelKey: "marketplace.sortInterestAsc" },
  { value: "amount-desc", labelKey: "marketplace.sortAmountDesc" },
  { value: "tenure-asc", labelKey: "marketplace.sortTenureAsc" },
];

function sortLoans(loans: LoanProduct[], sort: string): LoanProduct[] {
  const list = [...loans];
  switch (sort) {
    case "interest-asc":
      return list.sort((a, b) => a.interestRate - b.interestRate);
    case "amount-desc":
      return list.sort((a, b) => b.maxAmount - a.maxAmount);
    case "tenure-asc":
      return list.sort((a, b) => a.durationMonths - b.durationMonths);
    default:
      return list;
  }
}

const PAGE_SIZE = 6;

export default function LoanMarketplace({ onNavigate }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await loansApi.getLoanProducts({
          category,
          search: query,
          page,
        });
        let fetchedProducts = res.products || [];
        fetchedProducts = sortLoans(fetchedProducts, sort);
        setProducts(fetchedProducts);
        setTotal(res.total || 0);
      } catch (e) {
        console.error("Failed to fetch loan products", e);
      } finally {
        setIsLoading(false);
      }
    }
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [category, query, page, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = products;

  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          title={t("marketplace.title")}
          description={t("marketplace.description")}
        />
        <div className="flex flex-col gap-4 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_14rem] gap-3">
            <SearchInput
              placeholder={t("marketplace.searchPlaceholder")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setQuery("");
                setPage(1);
              }}
              aria-label={t("common.search")}
            />
            <Select
              aria-label={t("marketplace.sort")}
              options={sortOptions.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
              }))}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Tabs
              variant="pill"
              tabs={categories.map((c) => ({
                id: c.id,
                label: t(enumKey("category", c.id)),
              }))}
              activeTab={category}
              onChange={(id) => {
                setCategory(id);
                setPage(1);
              }}
            />
          </div>
        </div>
        <p className="text-sm text-stone-500 mb-4">
          {t(total === 1 ? "marketplace.loansFound_one" : "marketplace.loansFound_other", { count: total })}
        </p>
        {pageItems.length === 0 ? (
          <EmptyState
            icon={EmptyIcons.search}
            title={t("marketplace.emptyTitle")}
            description={t("marketplace.emptyDescription")}
            action={{
              label: t("marketplace.clearFilters"),
              onClick: () => {
                setQuery("");
                setCategory("all");
                setSort("recommended");
                setPage(1);
              },
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {pageItems.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onView={() => onNavigate("loan-details")}
                  onApply={() => onNavigate("loan-application")}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={total}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}

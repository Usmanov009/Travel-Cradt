import { useEffect, useState } from "react";

export interface CompanySummary {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
  description?: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(data.companies || []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  return { companies, loading };
}

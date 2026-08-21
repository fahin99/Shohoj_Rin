import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../lib/api';
import { InputWrapper } from './Input';

interface InstitutionComboboxProps {
  value: string;
  institutionId: string | null;
  onChange: (institution: { id: string | null; name: string }) => void;
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

interface Institution {
  institution_id: string;
  name: string;
  type: string;
  is_verified: boolean;
}

export default function InstitutionCombobox({
  value,
  institutionId,
  onChange,
  label,
  required,
  error,
  hint,
}: InstitutionComboboxProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchInstitutions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    try {
      const res = await apiRequest<{ institutions: Institution[] }>(
        `/institutions/search?q=${encodeURIComponent(searchQuery)}&limit=10`
      );
      if (res && res.institutions) {
        setOptions(res.institutions);
      } else if (Array.isArray(res)) {
        setOptions(res);
      } else {
        setOptions([]);
      }
    } catch (err) {
      console.error('Failed to search institutions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query !== value && isOpen) {
      const timer = setTimeout(() => {
        searchInstitutions(query);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query, isOpen, value, searchInstitutions]);

  const handleSelect = (inst: Institution) => {
    setQuery(inst.name);
    setIsOpen(false);
    onChange({ id: inst.institution_id, name: inst.name });
  };

  const handleCreateCustom = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const newInst = await apiRequest<Institution>('/institutions', {
        method: 'POST',
        body: JSON.stringify({ name: query }),
      });
      
      if (newInst && (newInst.institution_id || (newInst as any).id)) {
        setQuery(newInst.name);
        setIsOpen(false);
        onChange({ id: newInst.institution_id || (newInst as any).id, name: newInst.name });
      }
    } catch (err) {
      console.error('Failed to create institution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        searchInstitutions(query);
      }
      return;
    }

    const maxIndex = options.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < options.length) {
        handleSelect(options[selectedIndex]);
      } else if (selectedIndex === options.length) {
        handleCreateCustom();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const exactMatch = options.some(opt => opt.name.toLowerCase() === query.toLowerCase());

  const inputBase =
    'w-full bg-white text-navy text-sm rounded-[6px] border-[1.5px] border-stone-300 px-3 py-2.5 placeholder-stone-400 transition-colors duration-100 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50 disabled:cursor-not-allowed';
  const inputError = 'border-coral focus:border-coral focus:ring-coral/20';

  return (
    <InputWrapper label={label} error={error} hint={hint} required={required}>
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          className={`${inputBase} ${error ? inputError : ''}`}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
            if (!e.target.value) {
              onChange({ id: null, name: '' });
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            if (query && options.length === 0) searchInstitutions(query);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type to search..."
          required={required}
        />
        
        {isOpen && query && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-[6px] shadow-lg max-h-60 overflow-y-auto">
            {loading && options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-stone-500 text-center">Searching...</div>
            ) : (
              <ul className="py-1">
                {options.map((opt, index) => (
                  <li
                    key={opt.institution_id}
                    className={`px-4 py-2 cursor-pointer text-sm flex items-center justify-between ${
                      selectedIndex === index ? 'bg-teal-light text-navy' : 'hover:bg-stone-50 text-navy'
                    }`}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span>{opt.name}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">
                      {opt.type}
                    </span>
                  </li>
                ))}
                
                {options.length === 0 && !loading && (
                  <li className="px-4 py-3 text-sm text-stone-500 text-center">
                    No institutions found
                  </li>
                )}

                {!exactMatch && query.length > 1 && (
                  <li
                    className={`px-4 py-2 cursor-pointer text-sm text-teal font-medium border-t border-stone-100 ${
                      selectedIndex === options.length ? 'bg-teal-light' : 'hover:bg-stone-50'
                    }`}
                    onClick={handleCreateCustom}
                    onMouseEnter={() => setSelectedIndex(options.length)}
                  >
                    {loading && selectedIndex === options.length ? 'Adding...' : `Add "${query}" as custom institution`}
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
    </InputWrapper>
  );
}

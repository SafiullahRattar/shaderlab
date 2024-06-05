import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useShaders } from "../hooks/useShaders";
import SearchBar from "../components/SearchBar";
import ShaderCard from "../components/ShaderCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Gallery.css";

const CATEGORIES = [
  "All",
  "Abstract",
  "Fractals",
  "3D",
  "Nature",
  "Generative",
  "Minimal",
  "Classic",
];

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [activeCategory, setActiveCategory] = useState(currentCategory);

  const { shaders, total, totalPages, loading, error } = useShaders({
    page: currentPage,
    limit: 8,
    search: currentSearch,
    category: currentCategory,
  });

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    if (updates.category !== undefined || updates.search !== undefined) {
      next.delete("page");
    }
    setSearchParams(next);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    updateParams({ search: value });
  };

  const handleCategory = (cat: string) => {
    const val = cat === "All" ? "" : cat;
    setActiveCategory(val);
    updateParams({ category: val });
  };

  const handlePage = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <div className="gallery animate-fade-in-up">
      <header className="gallery-header">
        <h1 className="gallery-title">Shader Gallery</h1>
        <p className="gallery-subtitle">
          Browse, search, and explore real-time GLSL fragment shaders
        </p>
        <SearchBar value={searchInput} onChange={handleSearch} />
      </header>

      <div className="gallery-filters">
        {CATEGORIES.map((cat) => {
          const val = cat === "All" ? "" : cat;
          const isActive = activeCategory === val;
          return (
            <button
              key={cat}
              className={`filter-chip ${isActive ? "filter-chip-active" : ""}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading && <LoadingSpinner text="Loading shaders..." />}

      {error && (
        <div className="gallery-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && shaders.length === 0 && (
        <div className="gallery-empty">
          <p className="gallery-empty-icon">✦</p>
          <p className="gallery-empty-title">No shaders found</p>
          <p className="gallery-empty-text">
            {currentSearch || currentCategory
              ? "Try adjusting your search or filters."
              : "The gallery is empty. Be the first to create a shader!"}
          </p>
        </div>
      )}

      {!loading && !error && shaders.length > 0 && (
        <>
          <div className="gallery-grid">
            {shaders.map((shader) => (
              <ShaderCard key={shader.id} shader={shader} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="gallery-pagination">
              <button
                className="pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => handlePage(currentPage - 1)}
              >
                &larr; Prev
              </button>
              <div className="pagination-pages">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    className={`pagination-num ${p === currentPage ? "active" : ""}`}
                    onClick={() => handlePage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                className="pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => handlePage(currentPage + 1)}
              >
                Next &rarr;
              </button>
              <span className="pagination-info">
                {total} shader{total !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

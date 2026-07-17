import React, { useState, useEffect, useRef } from "react";
import "./GlobalSearch.css";
import { performGlobalSearch } from "../../utils/searchEngine";
import { useStore } from "../../Context/StoreContext";

function GlobalSearch({
  isOpen,
  onClose,
  onNavigate,
}) {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const store = useStore();

  // Auto-focus on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search as user types
  useEffect(() => {
    if (searchTerm.trim()) {
      const searchResults = performGlobalSearch(searchTerm, store);
      setResults(searchResults);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [searchTerm, store]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          break;

        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleClose = () => {
    setSearchTerm("");
    setResults([]);
    setSelectedIndex(-1);
    onClose();
  };

  const handleSelectResult = (result) => {
    onNavigate(result);
    handleClose();
  };

  if (!isOpen) return null;

  // Group results by module
  const groupedResults = {};
  results.forEach((result) => {
    if (!groupedResults[result.module]) {
      groupedResults[result.module] = [];
    }
    groupedResults[result.module].push(result);
  });

  const moduleOrder = [
    "INVENTORY",
    "TEMPORARY IV",
    "PERMANENT IV",
    "POLICE STATION DATA",
    "MOBILE VEHICLE DATA",
    "USER MANAGEMENT",
  ];

  let resultIndex = 0;
  const orderedModules = [];
  
  moduleOrder.forEach((module) => {
    if (groupedResults[module]) {
      orderedModules.push({
        module,
        results: groupedResults[module],
      });
    }
  });

  return (
    <div className="global-search-overlay" onClick={handleClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search GPW No., Serial No., IV No., Vehicle No., Police Station, Item Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {searchTerm.trim() === "" ? (
          <div className="search-placeholder">
            <p>🔍 Start typing to search across the entire WSMS.</p>
            <p style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
              Use ↑↓ to navigate, Enter to select, Esc to close
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="search-no-results">
            <p>No results found for "{searchTerm}"</p>
          </div>
        ) : (
          <div className="search-results">
            {orderedModules.map(({ module, results: moduleResults }) => (
              <div key={module} className="result-group">
                <div className="result-group-header">{module}</div>
                <div className="result-group-items">
                  {moduleResults.map((result) => {
                    const isSelected = resultIndex === selectedIndex;
                    const currentIndex = resultIndex;
                    resultIndex++;

                    return (
                      <div
                        key={result.id}
                        className={`result-item ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleSelectResult(result)}
                      >
                        <div className="result-title">{result.display.title}</div>
                        <div className="result-subtitle">
                          {result.display.subtitle}
                        </div>
                        {result.display.meta.length > 0 && (
                          <div className="result-meta">
                            {result.display.meta.map((meta, idx) => (
                              <span key={idx}>{meta}</span>
                            ))}
                          </div>
                        )}
                        <div className="result-match-type">
                          {result.matchType}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="search-footer">
          <span className="shortcut">
            <kbd>Esc</kbd> Close
          </span>
          <span className="shortcut">
            <kbd>↑↓</kbd> Navigate
          </span>
          <span className="shortcut">
            <kbd>Enter</kbd> Select
          </span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;

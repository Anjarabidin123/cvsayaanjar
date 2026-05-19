import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

const translationCache: Record<string, string> = {};

// Load cache from localStorage to keep it persistent and fast
try {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("translation_cache");
    if (saved) {
      Object.assign(translationCache, JSON.parse(saved));
    }
  }
} catch (e) {
  console.error("Failed to load translation cache", e);
}

const saveCache = () => {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem("translation_cache", JSON.stringify(translationCache));
    }
  } catch (e) {
    console.error("Failed to save translation cache", e);
  }
};

interface TranslateProps {
  text: string;
  maxChars?: number;
}

/**
 * Translate component that auto-translates database-driven text (Indonesian -> English)
 * using the free MyMemory translation API with client-side caching.
 * Supports smart expandable truncation.
 */
export function Translate({ text, maxChars }: TranslateProps) {
  const { lang } = useI18n();
  const [translated, setTranslated] = useState(text);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslated("");
      return;
    }

    // If the language is set to Indonesian, show the original database content
    if (lang === "id") {
      setTranslated(text);
      return;
    }

    const cacheKey = `${lang}:${text}`;
    if (translationCache[cacheKey]) {
      setTranslated(translationCache[cacheKey]);
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    // Fetch from MyMemory free translation API (Indonesian to English)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const result = data?.responseData?.translatedText;
        if (result) {
          translationCache[cacheKey] = result;
          saveCache();
          setTranslated(result);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Translation error:", err);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [text, lang]);

  if (loading) {
    return <span className="opacity-70 transition-opacity animate-pulse">{translated || text}</span>;
  }

  // Handle truncation if maxChars is provided
  if (maxChars && translated && translated.length > maxChars) {
    const displayText = expanded ? translated : `${translated.slice(0, maxChars)}...`;
    const readMoreLabel = lang === "id" ? "baca selengkapnya" : "read more";
    const readLessLabel = lang === "id" ? "sembunyikan" : "show less";

    return (
      <span>
        {displayText}{" "}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-accent hover:text-accent/80 font-semibold hover:underline inline-flex items-center ml-1 text-xs transition-colors duration-200"
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      </span>
    );
  }

  return <>{translated}</>;
}

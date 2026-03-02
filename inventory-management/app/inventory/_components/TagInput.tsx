"use client";

import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { tagService } from "@/services/tag.service";

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      searchTags(query);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  const searchTags = async (tag: string) => {
    try {
      setLoading(true);
      const res = await tagService.getTags(tag);
      setSuggestions(res.data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: Tag) => {
    if (!value.find((t) => t.id === tag.id)) {
      onChange([...value, tag]);
    }
    setQuery("");
    setShowDropdown(false);
  };

  const createTag = async () => {
    try {
      const res = await tagService.createTag(query);
      onChange([...value, res.data]);

      setQuery("");
      setShowDropdown(false);
    } catch (error) {
      console.error(error);
    }
  };

  const removeTag = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  const tagExists =
    suggestions.length > 0 &&
    suggestions.some((tag) => tag.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative w-full">
      <Input
        label="Tags"
        placeholder="Type to search or create tag"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="bordered"
        onFocus={() => setShowDropdown(true)}
      />

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((tag) => (
          <Chip key={tag.id} onClose={() => removeTag(tag.id)}>
            {tag.name}
          </Chip>
        ))}
      </div>

      {/* Dropdown */}
      {showDropdown && query && (
        <div className="absolute z-50 w-full bg-content1 border border-default-200 rounded-xl shadow-md mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <>
              {suggestions.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => addTag(tag)}
                  className="px-4 py-2 hover:bg-default-100 cursor-pointer"
                >
                  {tag.name}
                </div>
              ))}

              {!tagExists && (
                <div
                  onClick={createTag}
                  className="px-4 py-2 hover:bg-default-100 cursor-pointer flex items-center gap-2 text-primary"
                >
                  <Plus size={16} />
                  Create "{query}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

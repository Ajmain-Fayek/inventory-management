"use client";

import { userService } from "@/services/user.service";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserInputProps {
  value: User[];
  onChange: (tags: User[]) => void;
}

export default function UserInput({ value, onChange }: UserInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);
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

  const searchTags = async (user: string) => {
    try {
      setLoading(true);
      const res = await userService.getUser(user);
      setSuggestions(res.data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = (user: User) => {
    if (!value.find((u) => u.id === user.id)) {
      onChange([...value, user]);
    }
    setQuery("");
    setShowDropdown(false);
  };

  const removeUser = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  const userExists =
    suggestions.length !== 0 &&
    suggestions.some((user) => user.name.toLowerCase() === query.toLowerCase());

  return (
    <div className="relative w-full">
      <Input
        label="Users"
        placeholder="Type email to search user"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="bordered"
        onFocus={() => setShowDropdown(true)}
      />

      {/* Selected User */}
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((user) => (
          <Chip key={user.id} onClose={() => removeUser(user.id)}>
            {user.name}
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
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  onClick={() => addUser(user)}
                  className="px-4 py-2 hover:bg-default-100 cursor-pointer"
                >
                  {user.email}
                </div>
              ))}

              {!userExists && (
                <div className="px-4 text-red-600 py-2 hover:bg-default-100 cursor-pointer flex items-center gap-2">
                  User not found.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

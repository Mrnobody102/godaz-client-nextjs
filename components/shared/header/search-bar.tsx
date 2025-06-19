'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useState } from 'react';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = () => {
    // Thêm logic tìm kiếm tại đây, ví dụ: gọi API hoặc chuyển hướng
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="flex min-w-sm max-w-lg space-x-2">
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="flex-1 w-5xl"
      />
      <Button onClick={handleSearch}>
        <SearchIcon />
      </Button>
    </div>
  );
};

export default Search;

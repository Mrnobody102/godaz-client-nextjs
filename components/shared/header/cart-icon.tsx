'use client';

import { useState, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function CartIcon() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const newItem = {
    productId: '2',
    name: 'Iphone 16',
    image: '',
    slug: 'iphone-16',
    price: 150,
    quantity: 1,
  };

  const handleCartClick = () => {};

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    const popover = popoverRef.current;
    const button = buttonRef.current;

    const relatedTarget = e.relatedTarget as Node;
    if (
      popover &&
      button &&
      !popover.contains(relatedTarget) &&
      !button.contains(relatedTarget)
    ) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
          onClick={handleCartClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={buttonRef}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 z-50 transition-opacity duration-200 bg-background border border-border relative"
        align="end"
        ref={popoverRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ marginTop: '0.1rem' }} // Khoảng cách từ icon đến popover
      >
        {/* Tam giác gắn với popover, ở trên cùng gần icon */}
        <div className="absolute -top-2 right-0.5 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-b-background border-l-transparent border-r-transparent"></div>
        {newItem && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Sản phẩm mới: {newItem.name} (x{newItem.quantity})
            </p>
            <p className="text-sm text-muted-foreground">
              Giá: {newItem.price}k
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCartClick}
            >
              Xem giỏ hàng
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default CartIcon;

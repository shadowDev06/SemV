import { Utensils, CarFront, ShoppingBag, ReceiptText, Clapperboard, HeartPulse, MoreHorizontal } from 'lucide-react';
import { categoryDetails } from '../utils';

const icons = {
  food: Utensils,
  transport: CarFront,
  shopping: ShoppingBag,
  bills: ReceiptText,
  entertainment: Clapperboard,
  health: HeartPulse,
  other: MoreHorizontal,
};

export default function CategoryIcon({ category, size = 20, className = '' }) {
  const details = categoryDetails(category);
  const Icon = icons[details.icon] || MoreHorizontal;
  return (
    <span className={`category-icon ${className}`} style={{ '--category-color': details.color }} aria-hidden="true">
      <Icon size={size} strokeWidth={1.9} />
    </span>
  );
}

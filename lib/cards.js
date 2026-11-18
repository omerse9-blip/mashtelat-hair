import { cardPrice, cardImage, cardSizeText, availableFromShort } from "./siteData";

// כרטיס מוצר לתצוגה בקטלוג ובעמודי הקטגוריות
export function toCard(p, subscriptionMinPrice) {
  const isSubscription = !!p.is_subscription;
  return {
    id: p.id,
    name: p.name,
    in_stock: p.in_stock,
    _image: cardImage(p),
    _price: isSubscription ? subscriptionMinPrice : cardPrice(p),
    _sizeText: cardSizeText(p),
    _hasSizes: !!(p.has_sizes && p.product_sizes?.length),
    _multi: !!(p.has_sizes && p.product_sizes?.length > 1),
    _isSubscription: isSubscription,
    _availableFrom: availableFromShort(p),
  };
}

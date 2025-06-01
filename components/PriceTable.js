import { format } from 'date-fns';

export default function PriceTable({ prices, productName }) {
  const retailers = [
    { 
      key: 'currys', 
      name: 'Currys', 
      url: 'https://www.currys.co.uk',
      warranty: '1 year',
      returns: '30 days',
      color: '#0066CC',
      logo: '🔵'
    },
    { 
      key: 'argos', 
      name: 'Argos', 
      url: 'https://www.argos.co.uk',
      warranty: '1 year',
      returns: '30 days',
      color: '#ED1B2F',
      logo: '🔴'
    },
    { 
      key: 'amazonUK', 
      name: 'Amazon UK', 
      url: 'https://www.amazon.co.uk',
      warranty: '1 year',
      returns: '30 days',
      color: '#FF9900',
      logo: '🟠'
    },
    { 
      key: 'johnLewis', 
      name: 'John Lewis', 
      url: 'https://www.johnlewis.com',
      warranty: '2 years',
      returns: '35 days',
      color: '#006633',
      logo: '🟢'
    },
    { 
      key: 'very', 
      name: 'Very', 
      url: 'https://www.very.co.uk',
      warranty: '1 year',
      returns: '28 days',
      color: '#E4002B',
      logo: '🔴'
    }
  ];
  
  // Find lowest price
  let lowestPrice = Infinity;
  let lowestRetailer = '';
  let hasAnyPrice = false;
  
  retailers.forEach(retailer => {
    const price = prices[retailer.key];
    if (price && price > 0) {
      hasAnyPrice = true;
      if (price < lowestPrice) {
        lowestPrice = price;
        lowestRetailer = retailer.name;
      }
    }
  });
  
  if (!hasAnyPrice) {
    return null;
  }
  
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">💷 UK Price Comparison</h3>
        <span className="text-sm text-gray-600">
          Updated: {format(new Date(), 'dd MMM HH:mm')}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Retailer</th>
              <th className="text-right py-2">Price</th>
              <th className="text-center py-2 hidden sm:table-cell">Warranty</th>
              <th className="text-center py-2 hidden sm:table-cell">Returns</th>
              <th className="text-right py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {retailers.map(retailer => {
              const price = prices[retailer.key];
              const isLowest = retailer.name === lowestRetailer;
              
              return (
                <tr key={retailer.key} className="border-b border-gray-100">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{retailer.logo}</span>
                      <span className="font-medium">{retailer.name}</span>
                    </div>
                  </td>
                  <td className="text-right py-3">
                    {price && price > 0 ? (
                      <span className={`font-bold ${isLowest ? 'text-aria-success text-lg' : ''}`}>
                        £{price.toFixed(2)}
                        {isLowest && <span className="text-xs ml-1">✨</span>}
                      </span>
                    ) : (
                      <span className="text-gray-500">Out of stock</span>
                    )}
                  </td>
                  <td className="text-center py-3 hidden sm:table-cell">
                    <span className={retailer.warranty === '2 years' ? 'text-aria-success font-medium' : 'text-gray-600'}>
                      {retailer.warranty}
                    </span>
                  </td>
                  <td className="text-center py-3 hidden sm:table-cell text-gray-600">
                    {retailer.returns}
                  </td>
                  <td className="text-right py-3">
                    {price && price > 0 ? (
                      <a
                        href={retailer.url}
                        target="_blank"
                        rel="nofollow noopener"
                        className="text-aria-secondary hover:underline font-medium"
                      >
                        Check →
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {lowestRetailer && (
        <div className="mt-4 p-3 bg-aria-success/10 rounded-lg">
          <p className="text-sm">
            💡 <strong>Best Price:</strong> £{lowestPrice.toFixed(2)} at {lowestRetailer}
            {lowestRetailer === 'John Lewis' && (
              <span className="block text-xs mt-1 text-gray-600">
                Plus you get 2-year warranty as standard - worth the extra if it's close!
              </span>
            )}
          </p>
        </div>
      )}
      
      <p className="text-xs text-gray-600 mt-4">
        Prices checked hourly. All include free UK delivery. 
        I get the same commission from all retailers, so my recommendations are genuine.
      </p>
    </div>
  );
}
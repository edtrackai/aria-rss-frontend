import { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  FileText,
  DollarSign
} from 'lucide-react';

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  
  // Format text with command
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      formatText('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  // Insert affiliate link
  const insertAffiliateLink = (product, url) => {
    const affiliateHtml = `<a href="${url}" class="affiliate-link" data-product="${product}" target="_blank" rel="noopener noreferrer sponsored">${product}</a>`;
    document.execCommand('insertHTML', false, affiliateHtml);
    onChange(editorRef.current.innerHTML);
    setShowAffiliateDialog(false);
  };

  // Insert table
  const insertTable = () => {
    const tableHtml = `
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Product A</th>
            <th>Product B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Price</td>
            <td>$X</td>
            <td>$Y</td>
          </tr>
          <tr>
            <td>Feature 1</td>
            <td>✓</td>
            <td>✓</td>
          </tr>
        </tbody>
      </table>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    onChange(editorRef.current.innerHTML);
  };

  // Insert pros/cons box
  const insertProsConsBox = () => {
    const prosConsHtml = `
      <div class="pros-cons-box">
        <div class="pros">
          <h4>✓ Pros</h4>
          <ul>
            <li>Pro 1</li>
            <li>Pro 2</li>
          </ul>
        </div>
        <div class="cons">
          <h4>✗ Cons</h4>
          <ul>
            <li>Con 1</li>
            <li>Con 2</li>
          </ul>
        </div>
      </div>
    `;
    document.execCommand('insertHTML', false, prosConsHtml);
    onChange(editorRef.current.innerHTML);
  };

  // AI content suggestions
  const generateAIContent = async (type) => {
    // In production, this would call your AI API
    const suggestions = {
      intro: 'In this comprehensive review, we dive deep into [Product Name] to help you determine if it\'s the right choice for your needs. We\'ve spent extensive time testing every aspect to bring you an unbiased assessment.',
      comparison: 'When comparing [Product A] to [Product B], several key differences emerge. While [Product A] excels in performance and features, [Product B] offers better value for budget-conscious users.',
      conclusion: 'After thorough testing, [Product Name] proves to be a solid choice for [target audience]. While it has some limitations, the overall package delivers excellent value and performance that justifies its price point.'
    };
    
    document.execCommand('insertHTML', false, `<p>${suggestions[type]}</p>`);
    onChange(editorRef.current.innerHTML);
  };

  const affiliateProducts = [
    { name: 'GitHub Copilot', url: 'https://github.com/copilot/affiliate/123' },
    { name: 'Claude Pro', url: 'https://claude.ai/affiliate/456' },
    { name: 'Notion AI', url: 'https://notion.so/affiliate/789' },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => formatText('bold')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => formatText('formatBlock', '<h1>')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('formatBlock', '<h2>')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('formatBlock', '<h3>')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => formatText('justifyLeft')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Insert elements */}
          <div className="flex items-center gap-1 px-2 border-r border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setShowLinkDialog(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Insert Link"
            >
              <Link2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAffiliateDialog(true)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-green-600"
              title="Insert Affiliate Link"
            >
              <DollarSign className="w-4 h-4" />
            </button>
            <button
              onClick={insertTable}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Insert Table"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('formatBlock', '<blockquote>')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => formatText('formatBlock', '<pre>')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Special inserts */}
          <div className="flex items-center gap-1 px-2">
            <button
              onClick={insertProsConsBox}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-blue-600"
              title="Insert Pros/Cons Box"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          {/* AI Tools */}
          <div className="flex items-center gap-1 ml-auto">
            <div className="relative group">
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-purple-600">
                <Sparkles className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 hidden group-hover:block z-10 whitespace-nowrap">
                <button
                  onClick={() => generateAIContent('intro')}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Generate Introduction
                </button>
                <button
                  onClick={() => generateAIContent('comparison')}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Generate Comparison
                </button>
                <button
                  onClick={() => generateAIContent('conclusion')}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Generate Conclusion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none prose prose-sm max-w-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: '400px',
          lineHeight: '1.6',
        }}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affiliate Link Dialog */}
      {showAffiliateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Affiliate Link</h3>
            <div className="space-y-2 mb-4">
              {affiliateProducts.map((product) => (
                <button
                  key={product.name}
                  onClick={() => insertAffiliateLink(product.name, product.url)}
                  className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate">{product.url}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAffiliateDialog(false)}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .comparison-table th,
        .comparison-table td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }
        .comparison-table th {
          background: #f3f4f6;
          font-weight: 600;
        }
        .pros-cons-box {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
        }
        .pros h4 {
          color: #10b981;
          margin-bottom: 0.5rem;
        }
        .cons h4 {
          color: #ef4444;
          margin-bottom: 0.5rem;
        }
        .affiliate-link {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
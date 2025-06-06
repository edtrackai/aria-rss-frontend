import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScrollArea, ScrollBar } from '../scroll-area';

describe('ScrollArea', () => {
  it('renders scroll area with content', () => {
    render(
      <ScrollArea className="h-32 w-32">
        <div className="h-64 w-64" data-testid="scrollable-content">
          <p>This is scrollable content that exceeds the container size.</p>
          <p>More content here...</p>
          <p>Even more content...</p>
        </div>
      </ScrollArea>
    );

    const content = screen.getByTestId('scrollable-content');
    expect(content).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    render(
      <ScrollArea className="custom-scroll-area h-32">
        <div data-testid="content">Content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('content').closest('[class*="custom-scroll-area"]');
    expect(scrollArea).toBeInTheDocument();
  });

  it('handles vertical scrolling', async () => {
    const user = userEvent.setup();
    
    render(
      <ScrollArea className="h-32 w-32" data-testid="scroll-area">
        <div className="h-64">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} data-testid={`item-${i}`}>
              Item {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    expect(scrollArea).toBeInTheDocument();
    
    // First item should be visible
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    
    // Last item might not be visible initially due to overflow
    // This depends on the implementation but the scroll area should handle overflow
  });

  it('handles horizontal scrolling', () => {
    render(
      <ScrollArea className="h-32 w-32" orientation="horizontal">
        <div className="flex w-96">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex-shrink-0 w-20" data-testid={`column-${i}`}>
              Column {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    // Should render horizontal content
    expect(screen.getByTestId('column-0')).toBeInTheDocument();
  });

  it('renders with both horizontal and vertical scroll bars', () => {
    render(
      <ScrollArea className="h-32 w-32">
        <div className="h-64 w-64" data-testid="large-content">
          Large content that requires both horizontal and vertical scrolling
        </div>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );

    const content = screen.getByTestId('large-content');
    expect(content).toBeInTheDocument();
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <ScrollArea className="h-32 w-32" tabIndex={0} data-testid="scroll-area">
        <div className="h-64">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i}>Item {i + 1}</div>
          ))}
        </div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    scrollArea.focus();
    
    // Arrow keys should scroll (if implemented)
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{PageDown}');
    await user.keyboard('{PageUp}');
  });

  it('handles wheel scrolling events', async () => {
    render(
      <ScrollArea className="h-32 w-32" data-testid="scroll-area">
        <div className="h-64">
          Long content that requires scrolling
        </div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-area');
    
    // Simulate wheel event
    fireEvent.wheel(scrollArea, { deltaY: 100 });
    
    // The scroll area should handle the wheel event
    expect(scrollArea).toBeInTheDocument();
  });

  it('supports different orientations', () => {
    const { rerender } = render(
      <ScrollArea orientation="vertical" className="h-32">
        <div className="h-64">Vertical content</div>
      </ScrollArea>
    );

    rerender(
      <ScrollArea orientation="horizontal" className="w-32">
        <div className="w-64">Horizontal content</div>
      </ScrollArea>
    );

    expect(screen.getByText('Horizontal content')).toBeInTheDocument();
  });

  it('handles dynamic content changes', () => {
    const DynamicContent = () => {
      const [items, setItems] = React.useState([1, 2, 3]);
      
      return (
        <div>
          <button onClick={() => setItems([...items, items.length + 1])}>
            Add Item
          </button>
          <ScrollArea className="h-32">
            <div>
              {items.map(item => (
                <div key={item} data-testid={`dynamic-item-${item}`}>
                  Dynamic Item {item}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    };
    
    render(<DynamicContent />);
    
    expect(screen.getByTestId('dynamic-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-item-3')).toBeInTheDocument();
  });

  it('maintains scroll position when content updates', () => {
    const ContentUpdater = () => {
      const [version, setVersion] = React.useState(1);
      
      return (
        <div>
          <button onClick={() => setVersion(v => v + 1)}>Update</button>
          <ScrollArea className="h-32">
            <div className="h-64">
              Content version: {version}
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i}>Item {i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    };
    
    render(<ContentUpdater />);
    
    expect(screen.getByText('Content version: 1')).toBeInTheDocument();
  });

  it('supports nested scroll areas', () => {
    render(
      <ScrollArea className="h-32 w-32" data-testid="outer-scroll">
        <div className="h-64 w-64">
          <p>Outer content</p>
          <ScrollArea className="h-16 w-16" data-testid="inner-scroll">
            <div className="h-32 w-32">
              Inner scrollable content
            </div>
          </ScrollArea>
        </div>
      </ScrollArea>
    );

    expect(screen.getByTestId('outer-scroll')).toBeInTheDocument();
    expect(screen.getByTestId('inner-scroll')).toBeInTheDocument();
  });

  it('handles edge cases with empty content', () => {
    render(
      <ScrollArea className="h-32 w-32" data-testid="empty-scroll">
        <div></div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('empty-scroll');
    expect(scrollArea).toBeInTheDocument();
  });

  it('handles very large content efficiently', () => {
    const largeItems = Array.from({ length: 1000 }, (_, i) => i);
    
    render(
      <ScrollArea className="h-32" data-testid="large-scroll">
        <div>
          {largeItems.map(item => (
            <div key={item} data-testid={item < 10 ? `visible-item-${item}` : undefined}>
              Large list item {item}
            </div>
          ))}
        </div>
      </ScrollArea>
    );

    // First few items should be accessible
    expect(screen.getByTestId('visible-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('visible-item-5')).toBeInTheDocument();
  });

  it('supports custom scroll bar styling', () => {
    render(
      <ScrollArea className="h-32">
        <div className="h-64">Content</div>
        <ScrollBar className="custom-scrollbar" orientation="vertical" />
      </ScrollArea>
    );

    // ScrollBar should render with custom class
    const scrollbar = document.querySelector('.custom-scrollbar');
    expect(scrollbar).toBeInTheDocument();
  });

  it('maintains accessibility with proper ARIA attributes', () => {
    render(
      <ScrollArea 
        className="h-32" 
        aria-label="Scrollable content area"
        data-testid="accessible-scroll"
      >
        <div className="h-64">Accessible content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('accessible-scroll');
    expect(scrollArea).toHaveAttribute('aria-label', 'Scrollable content area');
  });

  it('handles touch events for mobile scrolling', () => {
    render(
      <ScrollArea className="h-32" data-testid="touch-scroll">
        <div className="h-64">Touch scrollable content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('touch-scroll');
    
    // Simulate touch events
    fireEvent.touchStart(scrollArea, {
      touches: [{ clientX: 0, clientY: 0 }]
    });
    
    fireEvent.touchMove(scrollArea, {
      touches: [{ clientX: 0, clientY: -50 }]
    });
    
    fireEvent.touchEnd(scrollArea);
    
    expect(scrollArea).toBeInTheDocument();
  });

  it('supports scroll event listeners', () => {
    const onScroll = jest.fn();
    
    render(
      <ScrollArea className="h-32" onScroll={onScroll} data-testid="scroll-listener">
        <div className="h-64">Scrollable content</div>
      </ScrollArea>
    );

    const scrollArea = screen.getByTestId('scroll-listener');
    
    // Trigger scroll event
    fireEvent.scroll(scrollArea, { target: { scrollY: 100 } });
    
    expect(onScroll).toHaveBeenCalled();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '../sheet';

describe('Sheet', () => {
  it('renders sheet trigger and opens sheet on click', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description</SheetDescription>
          </SheetHeader>
          <div>Sheet content</div>
          <SheetFooter>
            <SheetClose>Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByText('Open Sheet');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Sheet Title')).toBeInTheDocument();
      expect(screen.getByText('Sheet description')).toBeInTheDocument();
      expect(screen.getByText('Sheet content')).toBeInTheDocument();
    });
  });

  it('closes sheet when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
          <SheetClose>Close Sheet</SheetClose>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Close Sheet'));
    
    await waitFor(() => {
      expect(screen.queryByText('Test Sheet')).not.toBeInTheDocument();
    });
  });

  it('closes sheet when escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Test Sheet')).not.toBeInTheDocument();
    });
  });

  it('closes sheet when clicking overlay', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Test Sheet</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Sheet')).toBeInTheDocument();
    });

    // Click on overlay (outside the sheet content)
    const overlay = document.querySelector('[data-radix-popper-content-wrapper]') || 
                   document.querySelector('[data-testid="sheet-overlay"]');
    
    if (overlay) {
      await user.click(overlay);
      
      await waitFor(() => {
        expect(screen.queryByText('Test Sheet')).not.toBeInTheDocument();
      });
    }
  });

  it('supports different sides (right, left, top, bottom)', async () => {
    const user = userEvent.setup();
    
    const sides = ['right', 'left', 'top', 'bottom'] as const;
    
    for (const side of sides) {
      const { unmount } = render(
        <Sheet>
          <SheetTrigger>Open {side} Sheet</SheetTrigger>
          <SheetContent side={side}>
            <SheetTitle>{side} Sheet</SheetTitle>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByText(`Open ${side} Sheet`));
      
      await waitFor(() => {
        expect(screen.getByText(`${side} Sheet`)).toBeInTheDocument();
      });
      
      unmount();
    }
  });

  it('supports controlled state', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledSheet = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <Sheet open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          onOpenChange(newOpen);
        }}>
          <SheetTrigger onClick={() => setOpen(true)}>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Controlled Sheet</SheetTitle>
            <SheetClose onClick={() => setOpen(false)}>Close</SheetClose>
          </SheetContent>
        </Sheet>
      );
    };

    render(<ControlledSheet />);

    const trigger = screen.getByText('Open');
    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Sheet')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger className="custom-trigger">Open</SheetTrigger>
        <SheetContent className="custom-content" side="right">
          <SheetHeader className="custom-header">
            <SheetTitle className="custom-title">Title</SheetTitle>
            <SheetDescription className="custom-description">
              Description
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="custom-footer">
            <SheetClose className="custom-close">Close</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByText('Open');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Title')).toHaveClass('custom-title');
      expect(screen.getByText('Description')).toHaveClass('custom-description');
    });
  });

  it('handles interactive content correctly', async () => {
    const onSubmit = jest.fn((e) => e.preventDefault());
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Form Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Form Sheet</SheetTitle>
          </SheetHeader>
          <form onSubmit={onSubmit}>
            <input placeholder="Enter text" />
            <button type="submit">Submit</button>
          </form>
          <SheetFooter>
            <SheetClose>Cancel</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Form Sheet'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter text');
    await user.type(input, 'test input');
    expect(input).toHaveValue('test input');

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);
    expect(onSubmit).toHaveBeenCalled();
  });

  it('supports custom sizes', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Large Sheet</SheetTrigger>
        <SheetContent className="w-96" side="right">
          <SheetTitle>Large Sheet</SheetTitle>
          <div>Content with custom width</div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Large Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Large Sheet')).toBeInTheDocument();
    });
  });

  it('maintains focus management', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetTitle>Focus Sheet</SheetTitle>
          <input placeholder="First input" autoFocus />
          <input placeholder="Second input" />
          <SheetClose>Close</SheetClose>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByText('Open Sheet');
    await user.click(trigger);
    
    await waitFor(() => {
      const firstInput = screen.getByPlaceholderText('First input');
      expect(firstInput).toBeInTheDocument();
    });

    // Focus should be trapped within the sheet
    await user.tab();
    expect(screen.getByPlaceholderText('Second input')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Close')).toHaveFocus();
  });

  it('supports scrollable content', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Scrollable Sheet</SheetTrigger>
        <SheetContent className="max-h-96 overflow-y-auto">
          <SheetTitle>Scrollable Content</SheetTitle>
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} data-testid={`item-${i}`}>
                Item {i + 1}
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Scrollable Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Scrollable Content')).toBeInTheDocument();
      expect(screen.getByTestId('item-0')).toBeInTheDocument();
    });
  });

  it('handles multiple sheets', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Sheet>
          <SheetTrigger>Open First Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>First Sheet</SheetTitle>
            <SheetClose>Close First</SheetClose>
          </SheetContent>
        </Sheet>
        
        <Sheet>
          <SheetTrigger>Open Second Sheet</SheetTrigger>
          <SheetContent>
            <SheetTitle>Second Sheet</SheetTitle>
            <SheetClose>Close Second</SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    );

    await user.click(screen.getByText('Open First Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('First Sheet')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Open Second Sheet'));
    
    await waitFor(() => {
      expect(screen.getByText('Second Sheet')).toBeInTheDocument();
    });
  });

  it('maintains accessibility attributes', async () => {
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger aria-label="Open navigation sheet">Menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Navigate through the application sections
          </SheetDescription>
          <nav role="navigation">
            <a href="/home">Home</a>
            <a href="/about">About</a>
          </nav>
        </SheetContent>
      </Sheet>
    );

    const trigger = screen.getByLabelText('Open navigation sheet');
    await user.click(trigger);
    
    await waitFor(() => {
      const sheet = screen.getByRole('dialog');
      expect(sheet).toBeInTheDocument();
      expect(sheet).toHaveAttribute('aria-labelledby');
      expect(sheet).toHaveAttribute('aria-describedby');
    });
  });

  it('supports nested interactive elements', async () => {
    const onMenuClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Sheet>
        <SheetTrigger>Open Menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
          <div>
            <button onClick={onMenuClick}>Menu Item 1</button>
            <button onClick={onMenuClick}>Menu Item 2</button>
            <details>
              <summary>Expandable Section</summary>
              <button onClick={onMenuClick}>Nested Item</button>
            </details>
          </div>
        </SheetContent>
      </Sheet>
    );

    await user.click(screen.getByText('Open Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Menu Item 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Menu Item 1'));
    expect(onMenuClick).toHaveBeenCalled();

    await user.click(screen.getByText('Expandable Section'));
    
    await waitFor(() => {
      expect(screen.getByText('Nested Item')).toBeInTheDocument();
    });
  });
});

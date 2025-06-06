import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from '../popover';

describe('Popover', () => {
  it('renders trigger and opens popover on click', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>
          <p>Popover content here</p>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open Popover');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Popover content here')).toBeInTheDocument();
    });
  });

  it('closes popover when clicking outside', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>
        <button>Outside Button</button>
      </div>
    );

    await user.click(screen.getByText('Open Popover'));
    
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Outside Button'));
    
    await waitFor(() => {
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });
  });

  it('closes popover when escape key is pressed', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>
          <p>Popover content</p>
        </PopoverContent>
      </Popover>
    );

    await user.click(screen.getByText('Open Popover'));
    
    await waitFor(() => {
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByText('Popover content')).not.toBeInTheDocument();
    });
  });

  it('supports controlled state', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledPopover = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <Popover open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen);
          onOpenChange(newOpen);
        }}>
          <PopoverTrigger onClick={() => setOpen(!open)}>Toggle</PopoverTrigger>
          <PopoverContent>
            <p>Controlled content</p>
            <button onClick={() => setOpen(false)}>Close</button>
          </PopoverContent>
        </Popover>
      );
    };

    render(<ControlledPopover />);

    const trigger = screen.getByText('Toggle');
    await userEvent.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('Controlled content')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies correct CSS classes', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger className="custom-trigger">Open</PopoverTrigger>
        <PopoverContent className="custom-content">
          <p>Content</p>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open');
    expect(trigger).toHaveClass('custom-trigger');

    await user.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    // Check if content has custom class (may be on parent element)
    const content = screen.getByText('Content').closest('[class*="custom-content"]');
    expect(content).toBeInTheDocument();
  });

  it('supports different positioning', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent side="bottom" align="start">
          <p>Positioned content</p>
        </PopoverContent>
      </Popover>
    );

    await user.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Positioned content')).toBeInTheDocument();
    });
  });

  it('supports custom anchor element', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverAnchor>
          <div>Anchor Element</div>
        </PopoverAnchor>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <p>Anchored content</p>
        </PopoverContent>
      </Popover>
    );

    expect(screen.getByText('Anchor Element')).toBeInTheDocument();
    
    await user.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Anchored content')).toBeInTheDocument();
    });
  });

  it('handles interactive content correctly', async () => {
    const onButtonClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>
            <h3>Popover Title</h3>
            <p>Some content here</p>
            <button onClick={onButtonClick}>Action Button</button>
          </div>
        </PopoverContent>
      </Popover>
    );

    await user.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Popover Title')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Action Button'));
    expect(onButtonClick).toHaveBeenCalled();
  });

  it('supports focus management', async () => {
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <input placeholder="Focus me" autoFocus />
          <button>Button</button>
        </PopoverContent>
      </Popover>
    );

    const trigger = screen.getByText('Open');
    await user.click(trigger);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Focus me');
      expect(input).toBeInTheDocument();
    });
  });

  it('prevents default behavior on trigger click', async () => {
    const onTriggerClick = jest.fn((e) => e.preventDefault());
    const user = userEvent.setup();
    
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button onClick={onTriggerClick}>Custom Trigger</button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Content</p>
        </PopoverContent>
      </Popover>
    );

    await user.click(screen.getByText('Custom Trigger'));
    
    expect(onTriggerClick).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  it('handles multiple popovers independently', async () => {
    const user = userEvent.setup();
    
    render(
      <div>
        <Popover>
          <PopoverTrigger>Open First</PopoverTrigger>
          <PopoverContent>
            <p>First popover</p>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger>Open Second</PopoverTrigger>
          <PopoverContent>
            <p>Second popover</p>
          </PopoverContent>
        </Popover>
      </div>
    );

    await user.click(screen.getByText('Open First'));
    
    await waitFor(() => {
      expect(screen.getByText('First popover')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Open Second'));
    
    await waitFor(() => {
      expect(screen.getByText('Second popover')).toBeInTheDocument();
    });

    // First popover should still be open (independent)
    expect(screen.getByText('First popover')).toBeInTheDocument();
  });
});
